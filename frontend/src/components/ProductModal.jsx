import { useEffect, useState } from 'react'
import { Icon } from './Icons'
import { ProductVisual } from './ProductVisual'
import { apiRequest } from '../services/apiClient'

export function ProductModal({ product, onClose, onAdd }) {
  const [vendor, setVendor] = useState(null)
  const [sideCard, setSideCard] = useState(null) // null | 'vendor' | 'reviews'

  useEffect(() => {
    let active = true
    if (product?.sellerId) {
      apiRequest(`/api/users/${product.sellerId}`)
        .then((data) => {
          if (active && data) setVendor(data)
        })
        .catch(() => {
          if (active) setVendor(null)
        })
    } else {
      setVendor(null)
    }
    return () => { active = false }
  }, [product?.sellerId])

  if (!product) return null

  // Check whether a string looks like an internal UUID or identifier
  const isUuid = (val) => typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)

  // Retrieve any custom storefront brand saved by seller in Seller Workspace
  const savedStorefront = (() => {
    try {
      const bySeller = product?.sellerId ? localStorage.getItem(`northstar_storefront_${product.sellerId}`) : null
      const generic = localStorage.getItem('northstar_storefront_profile')
      const parsed = bySeller ? JSON.parse(bySeller) : (generic ? JSON.parse(generic) : null)
      return parsed || {}
    } catch {
      return {}
    }
  })()

  // Resolve human-friendly Merchant Title (never a raw UUID)
  const resolvedVendorName =
    (vendor?.firstName ? `${vendor.firstName} ${vendor.lastName || ''}`.trim() : null) ||
    (vendor?.username && !isUuid(vendor.username) ? vendor.username : null) ||
    (product?.sellerName && !isUuid(product.sellerName) ? product.sellerName : null) ||
    savedStorefront.storeName ||
    savedStorefront.sellerName ||
    "Aman Verma's Workshop"

  // Refined initials (e.g. "AV")
  const nameWords = resolvedVendorName.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/)
  const vendorInitials = (nameWords.length > 1
    ? (nameWords[0][0] + nameWords[1][0])
    : resolvedVendorName.slice(0, 2)
  ).toUpperCase()

  // Artisan subtitle/bio
  const vendorTagline =
    savedStorefront.bio ||
    (vendor?.email && !vendor.email.includes('-') ? vendor.email : null) ||
    'Curated objects & bespoke craftsmanship · Verified Studio Partner'

  const vendorCity = vendor?.address?.city
    ? `${vendor.address.city}, ${vendor.address.state || 'India'}`
    : 'Bengaluru, Karnataka'

  const vendorEmail = savedStorefront.email || (vendor?.email && !vendor.email.includes('-') ? vendor.email : 'varmaaman1078@gmail.com')
  const returnPolicy = savedStorefront.policy || '30-Day Free Returns'
  const inStock = (product.stock ?? 0) > 0

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div className={`modal-assembly ${sideCard ? 'has-side-card' : ''}`}>
        {/* Main Product Card */}
        <section className="product-modal" role="dialog" aria-modal="true" aria-label={product.name}>
          <button className="modal-close icon-button" onClick={onClose} aria-label="Close product details"><Icon name="close" /></button>
          <div className="modal-visual" style={{ '--product-bg': product.color, '--product-accent': product.accent }}>
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="modal-product-photo"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const fallback = e.currentTarget.parentElement?.querySelector('.modal-fallback-visual')
                  if (fallback) fallback.style.display = 'grid'
                }}
              />
            ) : null}
            <span className="modal-fallback-visual" style={product.imageUrl ? { display: 'none', width: '100%', height: '100%' } : { width: '100%', height: '100%' }}>
              <ProductVisual type={product.visual} />
            </span>
            <span className="modal-index">01 / 01</span>
          </div>
          <div className="modal-content">
            <span className="eyebrow"><span /> {product.category}</span>
            <h2>{product.name}</h2>

            {/* Clickable Rating trigger to open Reviews side card */}
            <div className="modal-rating-row">
              <button
                type="button"
                className={`modal-rating-button ${sideCard === 'reviews' ? 'active' : ''}`}
                onClick={() => setSideCard(sideCard === 'reviews' ? null : 'reviews')}
                aria-label="Toggle customer reviews"
              >
                <span className="rating-stars">★★★★★</span>
                <span className="rating-score">{product.rating}</span>
                <span className="rating-count">· {product.reviews} reviews</span>
                <span className="rating-link-action">{sideCard === 'reviews' ? 'Hide reviews' : 'See reviews →'}</span>
              </button>
            </div>

            <p>{product.description}</p>

            {/* Clickable Vendor option button to open Vendor Details side card */}
            <div className="modal-vendor-option-row">
              <button
                type="button"
                className={`modal-vendor-pill-button ${sideCard === 'vendor' ? 'active' : ''}`}
                onClick={() => setSideCard(sideCard === 'vendor' ? null : 'vendor')}
                aria-label="Toggle vendor details"
              >
                <div className="pill-left">
                  <span className="pill-avatar">{vendorInitials}</span>
                  <div className="pill-info">
                    <small>Sold & crafted by</small>
                    <strong>{resolvedVendorName}</strong>
                  </div>
                </div>
                <span className="pill-action">
                  {sideCard === 'vendor' ? 'Hide details' : 'View vendor details'}
                  <Icon name="arrow" size={13} />
                </span>
              </button>
            </div>

            <div className="detail-list">
              <div><Icon name="check" size={17} /><span><strong>Designed to last</strong><small>Considered materials, two-year warranty</small></span></div>
              <div><Icon name="truck" size={17} /><span><strong>Complimentary delivery</strong><small>Free over ₹750, easy 30-day returns</small></span></div>
            </div>

            <div className="modal-purchase">
              <span><small>Price</small><strong>₹{product.price.toLocaleString()}</strong></span>
              <button
                className="primary-button"
                disabled={!inStock}
                onClick={() => {
                  if (inStock) {
                    onAdd(product)
                    onClose()
                  }
                }}
                style={!inStock ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
              >
                {inStock ? 'Add to cart' : 'Out of stock'} <Icon name="bag" size={18} />
              </button>
            </div>

            {inStock ? (
              <p className="stock-line in-stock">
                <span className="stock-dot in" /> In stock · {product.stock} ready to ship
              </p>
            ) : (
              <p className="stock-line out-of-stock">
                <span className="stock-dot out" /> Out of stock · Restocking soon
              </p>
            )}
          </div>
        </section>

        {/* Inline Vendor Details Side Card */}
        {sideCard === 'vendor' && (
          <aside className="modal-side-card" role="dialog" aria-label="Vendor Details">
            <div className="side-card-header">
              <div className="side-card-heading">
                <Icon name="store" size={18} />
                <h3>Vendor Details</h3>
              </div>
              <button
                className="icon-button side-card-close"
                onClick={() => setSideCard(null)}
                aria-label="Close vendor details"
              >
                <Icon name="close" size={14} />
              </button>
            </div>
            <div className="side-card-body">
              <div className="vendor-profile-hero">
                <span className="vendor-profile-avatar">{vendorInitials}</span>
                <div className="vendor-profile-info">
                  <h4>{resolvedVendorName}</h4>
                  <span className="artisan-badge"><Icon name="check" size={10} /> Verified Merchant</span>
                  <small className="vendor-tagline">{vendorTagline}</small>
                </div>
              </div>

              <div className="side-metrics-strip">
                <div className="side-metric-item">
                  <span className="metric-label">Seller Rating</span>
                  <strong className="metric-val">4.9 ★</strong>
                  <small>128 reviews</small>
                </div>
                <div className="side-metric-item">
                  <span className="metric-label">Dispatch</span>
                  <strong className="metric-val">&lt; 24 hrs</strong>
                  <small>Order ready</small>
                </div>
                <div className="side-metric-item">
                  <span className="metric-label">Returns</span>
                  <strong className="metric-val">{returnPolicy.split(' ')[0]}</strong>
                  <small>Pickup</small>
                </div>
              </div>

              <div className="side-card-section">
                <h5>Provenance & Location</h5>
                <p className="side-card-text">
                  Independent workshop based in <strong>{vendorCity}</strong>. Every product from this atelier is inspected under the Northstar Quality Standard before fulfillment.
                </p>
              </div>

              <div className="side-card-section">
                <h5>Fulfillment & Guarantees</h5>
                <ul className="side-card-bullets">
                  <li><Icon name="shield" size={14} /> 100% genuine craftsmanship or full refund</li>
                  <li><Icon name="truck" size={14} /> Doorstep pickup for hassle-free returns</li>
                  <li><Icon name="check" size={14} /> Backed by Northstar Buyer Protection</li>
                </ul>
              </div>

              {vendorEmail && (
                <div className="side-card-footer-box">
                  <small>Official Merchant Support</small>
                  <strong>{vendorEmail}</strong>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Inline Customer Reviews Side Card */}
        {sideCard === 'reviews' && (
          <aside className="modal-side-card" role="dialog" aria-label="Customer Reviews">
            <div className="side-card-header">
              <div className="side-card-heading">
                <Icon name="star" size={18} />
                <h3>Customer Reviews</h3>
              </div>
              <button
                className="icon-button side-card-close"
                onClick={() => setSideCard(null)}
                aria-label="Close customer reviews"
              >
                <Icon name="close" size={14} />
              </button>
            </div>
            <div className="side-card-body">
              <div className="reviews-hero-card">
                <div className="reviews-score-block">
                  <strong>{product.rating || '4.8'}</strong>
                  <div className="stars-row">★★★★★</div>
                  <small>{product.reviews || 14} verified ratings</small>
                </div>
                <div className="reviews-breakdown-bars">
                  <div className="bar-row"><span>5 ★</span><div className="bar-track"><div className="bar-fill" style={{ width: '84%' }} /></div><span>84%</span></div>
                  <div className="bar-row"><span>4 ★</span><div className="bar-track"><div className="bar-fill" style={{ width: '12%' }} /></div><span>12%</span></div>
                  <div className="bar-row"><span>3 ★</span><div className="bar-track"><div className="bar-fill" style={{ width: '4%' }} /></div><span>4%</span></div>
                  <div className="bar-row"><span>2 ★</span><div className="bar-track"><div className="bar-fill" style={{ width: '0%' }} /></div><span>0%</span></div>
                  <div className="bar-row"><span>1 ★</span><div className="bar-track"><div className="bar-fill" style={{ width: '0%' }} /></div><span>0%</span></div>
                </div>
              </div>

              <div className="side-card-section">
                <h5>Verified Buyer Feedback</h5>
                <div className="reviews-stream">
                  <div className="review-bubble">
                    <div className="review-header-line">
                      <strong>Vikram S.</strong>
                      <span className="verified-badge"><Icon name="check" size={9} /> Verified</span>
                      <span className="review-date">3 days ago</span>
                    </div>
                    <div className="review-stars-line">★★★★★</div>
                    <p>Exceptional quality and finish. The tactile feel is reassuringly solid, exactly like shown in the catalog preview.</p>
                  </div>

                  <div className="review-bubble">
                    <div className="review-header-line">
                      <strong>Ananya R.</strong>
                      <span className="verified-badge"><Icon name="check" size={9} /> Verified</span>
                      <span className="review-date">1 week ago</span>
                    </div>
                    <div className="review-stars-line">★★★★★</div>
                    <p>Arrived early in thoughtful packaging. Really appreciate the craftsmanship and understated aesthetic.</p>
                  </div>

                  <div className="review-bubble">
                    <div className="review-header-line">
                      <strong>Karan M.</strong>
                      <span className="verified-badge"><Icon name="check" size={9} /> Verified</span>
                      <span className="review-date">2 weeks ago</span>
                    </div>
                    <div className="review-stars-line">★★★★☆</div>
                    <p>Solid build, fast dispatch. Does exactly what it promises without unnecessary branding.</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
