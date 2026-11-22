import { useState } from 'react'
import { Icon } from './Icons'
import { authService } from '../services/authService'

const initialSignup = {
  username: '', password: '', firstName: '', lastName: '', email: '', phone: '', userRole: 'CUSTOMER',
}

export function AuthPage({ onAuthenticated, onClose, initialMode = 'login', initialRole = 'CUSTOMER' }) {
  const [mode, setMode] = useState(initialMode)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [signupForm, setSignupForm] = useState({ ...initialSignup, userRole: initialRole })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const session = mode === 'login'
        ? await authService.login(loginForm.username, loginForm.password)
        : await authService.signup(signupForm)
      onAuthenticated(session)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  const changeMode = (nextMode) => { setMode(nextMode); setError('') }

  return (
    <main className="auth-page">
      <button className="auth-close icon-button" onClick={onClose} aria-label="Close authentication"><Icon name="close" /></button>
      <section className="auth-story">
        <a className="brand light" href="#auth"><span className="brand-mark"><span /></span>northstar</a>
        <div className="auth-story-copy"><span className="eyebrow"><span /> Thoughtful commerce</span><h1>Everything you need,<br /><em>in one place.</em></h1><p>Shop considered goods, grow your store, or manage the platform—with an experience shaped to your role.</p></div>
        <div className="auth-role-preview"><span><Icon name="user" /><b>Shop thoughtfully</b></span><span><Icon name="store" /><b>Grow your store</b></span></div>
      </section>
      <section className="auth-form-side">
        <div className="auth-card">
          <span className="eyebrow"><span /> Welcome to Northstar</span>
          <h2>{mode === 'login' ? 'Sign in to continue.' : 'Create your account.'}</h2>
          <p>{mode === 'login' ? 'Your workspace will open automatically based on your account role.' : 'Choose whether you want to shop or start selling.'}</p>
          <div className="auth-tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => changeMode('login')}>Sign in</button><button className={mode === 'signup' ? 'active' : ''} onClick={() => changeMode('signup')}>Create account</button></div>
          <form onSubmit={submit}>
            {mode === 'signup' && <>
              <div className="role-picker"><button type="button" className={signupForm.userRole === 'CUSTOMER' ? 'active' : ''} onClick={() => setSignupForm({ ...signupForm, userRole: 'CUSTOMER' })}><Icon name="user" /><span><strong>Customer</strong><small>Browse and purchase</small></span><i /></button><button type="button" className={signupForm.userRole === 'SELLER' ? 'active' : ''} onClick={() => setSignupForm({ ...signupForm, userRole: 'SELLER' })}><Icon name="store" /><span><strong>Seller</strong><small>List and fulfil</small></span><i /></button></div>
              <div className="form-row"><label>First name<input required value={signupForm.firstName} onChange={(event) => setSignupForm({ ...signupForm, firstName: event.target.value })} /></label><label>Last name<input required value={signupForm.lastName} onChange={(event) => setSignupForm({ ...signupForm, lastName: event.target.value })} /></label></div>
              <label>Email address<input required type="email" value={signupForm.email} onChange={(event) => setSignupForm({ ...signupForm, email: event.target.value })} /></label>
            </>}
            <label>Username<input required autoComplete="username" value={mode === 'login' ? loginForm.username : signupForm.username} onChange={(event) => mode === 'login' ? setLoginForm({ ...loginForm, username: event.target.value }) : setSignupForm({ ...signupForm, username: event.target.value })} /></label>
            <label>Password<input required minLength="8" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={mode === 'login' ? loginForm.password : signupForm.password} onChange={(event) => mode === 'login' ? setLoginForm({ ...loginForm, password: event.target.value }) : setSignupForm({ ...signupForm, password: event.target.value })} /></label>
            {error && <div className="auth-error"><Icon name="alert" size={16} />{error}</div>}
            <button className="primary-button auth-submit" disabled={loading}>{loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : `Create ${signupForm.userRole === 'SELLER' ? 'seller' : 'customer'} account`}<Icon name="arrow" /></button>
          </form>
          <small className="auth-security"><Icon name="shield" size={14} />Secured by Keycloak · Your password is never stored in this frontend</small>
        </div>
      </section>
    </main>
  )
}
