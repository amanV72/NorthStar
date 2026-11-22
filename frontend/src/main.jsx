import { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Northstar UI error caught by ErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            fontFamily: "'DM Sans', sans-serif",
            background: '#f7f5ef',
            color: '#172522',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '36px',
              maxWidth: '520px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
              border: '1px solid #deddd6',
            }}
          >
            <h2 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: '700' }}>Something went wrong</h2>
            <p style={{ color: '#697570', fontSize: '14px', lineHeight: '1.6', margin: '0 0 20px' }}>
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              type="button"
              onClick={() => {
                window.location.reload()
              }}
              style={{
                background: '#153f38',
                color: '#fff',
                border: '0',
                borderRadius: '100px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
