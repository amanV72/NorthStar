import { Icon } from './Icons'

export function Header({ activeView, cartCount, onNavigate, onCartOpen, onSearchOpen, session, onLogin, onBecomeSeller, onLogout }) {
  const links = [
    ['home', 'Home'],
    ['shop', 'Shop'],
    ['orders', 'Orders'],
  ]

  return (
    <header className="site-header">
      <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); onNavigate('home') }}>
        <span className="brand-mark"><span /></span>
        northstar
      </a>

      <nav className="desktop-nav" aria-label="Primary navigation">
        {links.map(([view, label]) => (
          <button className={activeView === view ? 'active' : ''} key={view} onClick={() => onNavigate(view)}>
            {label}
          </button>
        ))}
      </nav>

      <div className="header-actions">
        <button className="icon-button search-button" aria-label="Search products" onClick={onSearchOpen}>
          <Icon name="search" />
        </button>
        {session ? <>
          <button className="icon-button account-button" aria-label="View account" onClick={() => onNavigate('account')}><Icon name="user" /></button>
          <button className="logout-button" onClick={onLogout}>Sign out</button>
        </> : <>
          <button className="seller-cta" onClick={onBecomeSeller}><Icon name="store" size={15} /> Become a seller</button>
          <button className="login-button" onClick={onLogin}>Sign in</button>
        </>}
        <button className="cart-button" aria-label={`Open cart with ${cartCount} items`} onClick={onCartOpen}>
          <Icon name="bag" />
          <span>Cart</span>
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>
      </div>
    </header>
  )
}
