export function Footer({ onNavigate }) {
  return (
    <footer className="site-footer">
      <div className="footer-main section-shell">
        <div className="footer-brand">
          <a className="brand light" href="#home" onClick={(event) => { event.preventDefault(); onNavigate('home') }}>
            <span className="brand-mark"><span /></span>northstar
          </a>
          <p>Well-made things for the<br />everyday moments that matter.</p>
        </div>
        <div className="footer-links"><strong>Explore</strong><button onClick={() => onNavigate('shop')}>All products</button><button>New arrivals</button><button>Our story</button></div>
        <div className="footer-links"><strong>Help</strong><button>Shipping & returns</button><button>Contact</button><button>FAQ</button></div>
        <div className="newsletter"><strong>Notes worth keeping</strong><p>New releases and thoughtful stories, occasionally.</p><label><input type="email" placeholder="Email address" aria-label="Email address" /><button aria-label="Subscribe">→</button></label></div>
      </div>
      <div className="footer-bottom section-shell"><span>© 2026 Northstar Goods</span><span>Concept storefront · Built for an e-commerce microservices portfolio</span></div>
    </footer>
  )
}
