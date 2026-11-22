import { API_URL, authService } from './authService'

export async function apiRequest(path, options = {}, isRetry = false) {
  let session = authService.getSession()
  if (session && session.expiresAt <= Date.now() + 15000 && session.refreshToken) {
    const refreshed = await authService.refreshSession()
    if (refreshed) session = refreshed
  }

  const headers = new Headers(options.headers)
  if (session?.accessToken) headers.set('Authorization', `Bearer ${session.accessToken}`)
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 7000)
  const signal = options.signal || controller.signal

  try {
    const response = await fetch(`${API_URL}${path}`, { ...options, headers, signal })
    clearTimeout(timeoutId)

    if (response.status === 401) {
      if (!isRetry) {
        const refreshedSession = await authService.refreshSession()
        if (refreshedSession?.accessToken) {
          return apiRequest(path, options, true)
        }
      }
      authService.logout()
      window.dispatchEvent(new Event('northstar:unauthorized'))
      throw new Error('Your session is no longer valid. Please sign in again.')
    }
    if (!response.ok) {
      const responseText = await response.text()
      let message = responseText
      try {
        const errorJson = responseText ? JSON.parse(responseText) : null
        message = errorJson?.detail || errorJson?.message || errorJson?.title || responseText
      } catch {
        message = responseText
      }
      throw new Error(message || `Request failed with status ${response.status}`)
    }
    if (response.status === 204) return null
    const contentType = response.headers.get('content-type') ?? ''
    return contentType.includes('application/json') ? response.json() : response.text()
  } catch (err) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please check your backend connection.')
    }
    throw err
  }
}
