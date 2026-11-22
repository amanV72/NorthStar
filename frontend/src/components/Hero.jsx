import { Icon } from './Icons'

export function Hero({ onShop, onExploreCategories }) {
  const scrollToCategories = () => {
    if (onExploreCategories) {
      onExploreCategories()
    } else {
      const el = document.getElementById('shop-categories')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      else if (onShop) onShop()
    }
  }

  return (
    <div className="hero-wrapper" aria-label="Northstar Marketplace Welcome">
      <section className="centered-hero-section section-shell">
        {/* Subtle creative ambient graphics */}
        <div className="centered-hero-glow" aria-hidden="true" />
        <div className="hero-accent-circle circle-1" aria-hidden="true" />
        <div className="hero-accent-circle circle-2" aria-hidden="true" />
        <span className="hero-crosshair top-left" aria-hidden="true">✦</span>
        <span className="hero-crosshair top-right" aria-hidden="true">✦</span>

        {/* Main Centered Content */}
        <div className="centered-hero-content">
          <div className="centered-hero-badge">
            <span className="live-pulse-dot" />
            <span>Direct from verified sellers</span>
          </div>

          <h1 className="centered-hero-title">
            Quality products.<br />
            <em>Made for everyday life.</em>
          </h1>

          <p className="centered-hero-lead">
            Find simple, well-made items directly from independent stores and makers across India.
            Fair prices, authentic goods, and secure payments with Razorpay.
          </p>

          {/* Action Buttons */}
          <div className="centered-hero-actions">
            <button
              type="button"
              className="primary-button hero-main-btn"
              onClick={() => onShop && onShop()}
            >
              Shop All Products <Icon name="arrow" />
            </button>
            <button
              type="button"
              className="secondary-button hero-sub-btn"
              onClick={scrollToCategories}
            >
              Explore Categories <Icon name="chevron" size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* Minimal Boundary Line Strip separating Hero and Category Section */}
      <div className="hero-boundary-strip" aria-label="Marketplace Guarantees">
        <div className="boundary-strip-inner section-shell">
          <div className="boundary-item">
            <span className="boundary-icon"><Icon name="truck" size={16} /></span>
            <div>
              <strong>Free Delivery</strong>
              <small>On orders over ₹750</small>
            </div>
          </div>

          <div className="boundary-divider" aria-hidden="true" />

          <div className="boundary-item">
            <span className="boundary-icon"><Icon name="shield" size={16} /></span>
            <div>
              <strong>Secure Payment</strong>
              <small>100% safe via Razorpay</small>
            </div>
          </div>

          <div className="boundary-divider" aria-hidden="true" />

          <div className="boundary-item">
            <span className="boundary-icon"><Icon name="check" size={16} /></span>
            <div>
              <strong>Easy Returns</strong>
              <small>30 days return policy</small>
            </div>
          </div>

          <div className="boundary-divider" aria-hidden="true" />

          <div className="boundary-item">
            <span className="boundary-icon"><Icon name="star" size={16} /></span>
            <div>
              <strong>4.9 / 5 Rating</strong>
              <small>From verified buyers</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
