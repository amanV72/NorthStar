const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || ''
const REALM = import.meta.env.VITE_KEYCLOAK_REALM || 'ecom-app'
const CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'oauth2-pkce'
const API_URL = import.meta.env.VITE_API_URL || ''
const SESSION_KEY = 'northstar.session'

function decodeToken(token) {
  const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(decodeURIComponent(atob(payload).split('').map((character) =>
    `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`).join('')))
}

function resolveRole(claims) {
  const roles = claims.resource_access?.[CLIENT_ID]?.roles ?? []
  if (roles.includes('ADMIN')) return 'ADMIN'
  if (roles.includes('SELLER')) return 'SELLER'
  if (roles.includes('USER')) return 'USER'
  throw new Error('Your account does not have an application role.')
}

async function login(username, password) {
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'password',
    username,
    password,
    scope: 'openid profile email',
  })
  const response = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!response.ok) throw new Error('Invalid username or password.')

  const tokens = await response.json()
  const claims = decodeToken(tokens.access_token)
  const session = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
    userId: claims.sub ?? claims.preferred_username ?? username,
    role: resolveRole(claims),
    username: claims.preferred_username ?? username,
    name: claims.name ?? claims.preferred_username ?? username,
    email: claims.email ?? '',
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

async function signup(details) {
  const response = await fetch(`${API_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(details),
  })
  if (!response.ok) {
    const responseText = await response.text()
    let message = responseText
    try {
      const errorJson = responseText ? JSON.parse(responseText) : null
      message = errorJson?.detail || errorJson?.message || errorJson?.title || responseText
    } catch { }
    throw new Error(message || 'Account creation failed.')
  }
  return login(details.username, details.password)
}

let refreshPromise = null

async function refreshSession() {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (!raw) return null
      const session = JSON.parse(raw)
      if (!session?.refreshToken) {
        logout()
        return null
      }

      const body = new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: session.refreshToken,
      })

      const response = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      })

      if (!response.ok) {
        if (response.status === 400 || response.status === 401) {
          logout()
          window.dispatchEvent(new Event('northstar:unauthorized'))
        }
        return null
      }

      const tokens = await response.json()
      const claims = decodeToken(tokens.access_token)
      const updatedSession = {
        ...session,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || session.refreshToken,
        expiresAt: Date.now() + (tokens.expires_in || 300) * 1000,
        userId: session.userId ?? claims.sub ?? claims.preferred_username,
        role: resolveRole(claims),
        username: claims.preferred_username ?? session.username,
        name: claims.name ?? claims.preferred_username ?? session.name,
        email: claims.email ?? session.email,
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession))
      return updatedSession
    } catch {
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    if (!session?.accessToken) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    if (!session.userId) {
      const claims = decodeToken(session.accessToken)
      session.userId = claims.sub ?? claims.preferred_username ?? session.username
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    }
    // If token is about to expire within 45 seconds or already expired, trigger background refresh
    if (session.expiresAt <= Date.now() + 45000 && session.refreshToken) {
      refreshSession()
    }
    return session
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export const authService = { getSession, refreshSession, login, logout, signup }
export { API_URL }
