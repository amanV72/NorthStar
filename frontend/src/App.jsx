import { useEffect, useMemo, useRef, useState } from 'react'
import { CartDrawer } from './components/CartDrawer'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Icon } from './components/Icons'
import { ProductCard } from './components/ProductCard'
import { ProductModal } from './components/ProductModal'
import { ProductVisual } from './components/ProductVisual'
import { AdminDashboard, SellerDashboard } from './components/PortalDashboards'
import { AuthPage } from './components/AuthPage'
import { AddressModal } from './components/AddressModal'
import { categories, products as catalogProducts } from './data/catalog'
import { storefrontService } from './services/storefrontService'
import { authService } from './services/authService'
import { openRazorpayCheckout } from './services/razorpayService'

function ProductGrid({ items, favorites, onFavorite, onSelect, onAdd }) {
  return (
    <div className="product-grid">
      {items.map((product) => (
        <ProductCard
          favorite={favorites.includes(product.id)}
          key={product.id}
          product={product}
          onAdd={onAdd}
          onFavorite={onFavorite}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

function HomeView({ products, favorites, onFavorite, onSelect, onAdd, onNavigate }) {
  const [activeCategoryTab, setActiveCategoryTab] = useState('All')

  const categoryCards = [
    {
      id: 'Workspace',
      title: 'Desk & Lighting',
      tagline: 'Lamps, pads & organizers',
      description: 'Lamps, desk mats, and organizers to keep your workspace clean and productive.',
      visual: 'lamp',
      color: '#d7e7df',
      accent: '#26635a',
      count: 'Workspace',
    },
    {
      id: 'Audio',
      title: 'Headphones & Audio',
      tagline: 'Clear & balanced sound',
      description: 'Over-ear headphones and portable wireless speakers for music, calls, and movies.',
      visual: 'headphones',
      color: '#e7dfd2',
      accent: '#b05d3b',
      count: 'Audio',
    },
    {
      id: 'Home',
      title: 'Home & Kitchen',
      tagline: 'Decor & tableware',
      description: 'Carafes, cups, stoneware, and decor to make your living space feel warm and comfortable.',
      visual: 'carafe',
      color: '#eadfce',
      accent: '#9a6b3e',
      count: 'Home',
    },
    {
      id: 'Travel',
      title: 'Bags & Accessories',
      tagline: 'Daily carry & travel',
      description: 'Durable carry bags, protective phone cases, and organizers built for everyday travel.',
      visual: 'bag',
      color: '#dce2ea',
      accent: '#425c7a',
      count: 'Accessories',
    },
  ]

  const featuredList = useMemo(() => {
    const list = Array.isArray(products) && products.length > 0 ? products : catalogProducts
    if (activeCategoryTab === 'All') return list.slice(0, 8)
    const filtered = list.filter((p) => (p?.category || '').toLowerCase() === activeCategoryTab.toLowerCase())
    return filtered.length > 0 ? filtered.slice(0, 8) : list.slice(0, 8)
  }, [products, activeCategoryTab])

  return (
    <main className="modern-home-main">
      {/* 1. Creative Centered Hero (No product image, clean & direct) */}
      <Hero
        onShop={(cat) => onNavigate('shop', cat)}
        onExploreCategories={() => {
          const target = document.getElementById('shop-categories')
          if (target) target.scrollIntoView({ behavior: 'smooth' })
        }}
      />

      {/* 2. Shop By Category Grid */}
      <section id="shop-categories" className="category-worlds-section section-shell">
        <div className="section-header-centered">
          <span className="eyebrow"><span /> Categories</span>
          <h2>Shop by Category</h2>
          <p>Find what you need for your desk, sound, home, and travel.</p>
        </div>

        <div className="worlds-grid">
          {categoryCards.map((card) => (
            <div
              key={card.id}
              className="world-card"
              style={{ '--world-bg': card.color, '--world-accent': card.accent }}
              onClick={() => onNavigate('shop', card.id)}
              role="button"
              tabIndex={0}
              aria-label={`Browse ${card.title}`}
            >
              <div className="world-card-top">
                <span className="world-tag">{card.tagline}</span>
                <span className="world-count">{card.count}</span>
              </div>
              <div className="world-visual-stage">
                <ProductVisual type={card.visual} />
              </div>
              <div className="world-card-bottom">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <span className="world-explore-link">
                  Browse products <Icon name="arrow" size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Featured Products Collection */}
      <section className="featured-section section-shell">
        <div className="section-heading">
          <div>
            <span className="eyebrow"><span /> Handpicked</span>
            <h2>Featured Products</h2>
            <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: '15px' }}>
              Popular products ready to ship directly to your door.
            </p>
          </div>
          <button
            type="button"
            className="text-button"
            onClick={() => onNavigate('shop', activeCategoryTab === 'All' ? undefined : activeCategoryTab)}
          >
            View all ({products?.length || catalogProducts.length}) <Icon name="arrow" />
          </button>
        </div>

        {/* Quick Filter Tabs */}
        <div className="collection-filter-tabs" role="tablist" aria-label="Filter featured items">
          {[
            { id: 'All', label: 'All Items' },
            { id: 'Workspace', label: 'Desk & Lighting' },
            { id: 'Audio', label: 'Audio' },
            { id: 'Home', label: 'Home' },
            { id: 'Travel', label: 'Bags & Cases' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`filter-tab ${activeCategoryTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveCategoryTab(tab.id)}
              role="tab"
              aria-selected={activeCategoryTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <ProductGrid
          items={featuredList}
          favorites={favorites}
          onFavorite={onFavorite}
          onSelect={onSelect}
          onAdd={onAdd}
        />
      </section>

      {/* 4. Why Shop With Us? */}
      <section className="craft-manifesto-section section-shell">
        <div className="manifesto-banner">
          <div className="manifesto-ambient-orb" />
          <div className="manifesto-copy">
            <span className="eyebrow" style={{ color: '#d7e7df' }}>
              <span style={{ background: '#d7e7df' }} /> Why Northstar?
            </span>
            <h2>Great products.<br /><em>Honest prices.</em></h2>
            <p>
              We connect you directly with independent sellers and craft workshops across India. No extra markups, no cheap disposable junk.
            </p>
            <div className="manifesto-pillars">
              <div className="pillar-item">
                <span className="pillar-num">01</span>
                <div>
                  <strong>Direct From Sellers</strong>
                  <p>Makers sell directly to you. Independent creators get fair pay without middleman fees.</p>
                </div>
              </div>
              <div className="pillar-item">
                <span className="pillar-num">02</span>
                <div>
                  <strong>Quality Materials</strong>
                  <p>Solid brass, wood, stoneware ceramics, and tough fabrics designed to last for years.</p>
                </div>
              </div>
              <div className="pillar-item">
                <span className="pillar-num">03</span>
                <div>
                  <strong>100% Safe Payments</strong>
                  <p>Your payment is safely held with Razorpay until your package arrives at your door.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="manifesto-visual-card">
            <div className="craft-card-inner">
              <span className="craft-stamp">✦ NORTHSTAR GUARANTEE</span>
              <h3>“Simple, honest shopping with reliable sellers.”</h3>
              <p>Backed by doorstep buyer protection</p>
              <div className="craft-badge-row">
                <span>Fast Shipping</span>
                <span>Genuine Goods</span>
                <span>Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Customer Reviews */}
      <section className="editorial-reviews-section section-shell">
        <div className="section-header-centered">
          <span className="eyebrow"><span /> Real Feedback</span>
          <h2>What our customers say</h2>
          <p>Real reviews from verified buyers across India.</p>
        </div>
        <div className="reviews-cards-grid">
          <div className="editorial-review-card">
            <div className="review-stars">★★★★★</div>
            <blockquote>“The desk lamp is really well built and the lighting is great for working at night. Smooth finish and heavy base.”</blockquote>
            <div className="review-buyer">
              <span className="buyer-avatar">SK</span>
              <div>
                <strong>Sarah K.</strong>
                <small>Bengaluru · Verified Buyer</small>
              </div>
            </div>
          </div>

          <div className="editorial-review-card">
            <div className="review-stars">★★★★★</div>
            <blockquote>“Ordered on Tuesday and received it Thursday morning. Very neat cardboard packaging with no plastic. Highly satisfied.”</blockquote>
            <div className="review-buyer">
              <span className="buyer-avatar">RM</span>
              <div>
                <strong>Rahul M.</strong>
                <small>Mumbai · Verified Buyer</small>
              </div>
            </div>
          </div>

          <div className="editorial-review-card">
            <div className="review-stars">★★★★★</div>
            <blockquote>“Great quality phone case and nice texture. Feels solid in the hand and fits perfectly. Will definitely buy again.”</blockquote>
            <div className="review-buyer">
              <span className="buyer-avatar">AV</span>
              <div>
                <strong>Anita V.</strong>
                <small>New Delhi · Verified Buyer</small>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function ShopView({ products, favorites, onFavorite, onSelect, onAdd, selectedCategory = 'All', onSelectCategory }) {
  const [sort, setSort] = useState('Featured')
  const categoriesList = [
    { id: 'All', label: 'All Items' },
    { id: 'Workspace', label: 'Desk & Lighting' },
    { id: 'Audio', label: 'Audio & Sound' },
    { id: 'Home', label: 'Home & Kitchen' },
    { id: 'Travel', label: 'Bags & Cases' },
  ]

  const visibleProducts = useMemo(() => {
    let list = Array.isArray(products) && products.length > 0 ? [...products] : [...catalogProducts]
    if (selectedCategory && selectedCategory !== 'All') {
      list = list.filter((p) => (p?.category || '').toLowerCase() === selectedCategory.toLowerCase())
    }
    if (sort === 'Price: low to high') return list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    if (sort === 'Highest rated') return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    return list
  }, [products, selectedCategory, sort])

  return (
    <main className="inner-page section-shell">
      <div className="page-intro">
        <span className="eyebrow"><span /> Marketplace</span>
        <h1>All Products</h1>
        <p>Browse through quality, enduring goods made by independent sellers.</p>
      </div>

      {/* Category Pills */}
      <div className="shop-category-pills" role="tablist" aria-label="Filter shop items">
        {categoriesList.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`shop-cat-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => onSelectCategory && onSelectCategory(cat.id)}
            role="tab"
            aria-selected={selectedCategory === cat.id}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="shop-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p className="result-count" style={{ margin: 0 }}>
          {visibleProducts.length} {selectedCategory !== 'All' ? `${selectedCategory} products` : 'products available'}
        </p>
        <label className="sort-select">
          Sort by <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option>Featured</option>
            <option>Price: low to high</option>
            <option>Highest rated</option>
          </select>
        </label>
      </div>

      <div style={{ marginTop: '24px' }}>
        <ProductGrid items={visibleProducts} favorites={favorites} onFavorite={onFavorite} onSelect={onSelect} onAdd={onAdd} />
      </div>
    </main>
  )
}

function OrderTracker({ status }) {
  const steps = [
    { key: 'PLACED', label: 'Order Placed', desc: 'Received & verified' },
    { key: 'CONFIRMED', label: 'Confirmed', desc: 'Prepared by seller' },
    { key: 'SHIPPED', label: 'In Transit', desc: 'On the way to you' },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Safely arrived' },
  ]

  const getStepIndex = (st) => {
    switch (st) {
      case 'DELIVERED': return 3
      case 'SHIPPED': return 2
      case 'CONFIRMED': return 1
      case 'PAYMENT_PENDING':
      case 'CREATED': return 0
      case 'CANCELLED': return -1
      default: return 1
    }
  }

  const currentIdx = getStepIndex(status)
  if (status === 'CANCELLED') {
    return (
      <div className="order-cancelled-banner">
        <span>⚠ This order was cancelled</span>
      </div>
    )
  }

  return (
    <div className="order-tracker">
      <div className="tracker-steps">
        {steps.map((step, idx) => {
          const isDone = idx <= currentIdx
          const isCurrent = idx === currentIdx
          return (
            <div key={step.key} className={`tracker-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
              <div className="step-node">
                {isDone ? (
                  <span className="step-check">✓</span>
                ) : (
                  <span className="step-dot" />
                )}
                {idx < steps.length - 1 && (
                  <span className={`step-connector ${idx < currentIdx ? 'done' : ''}`} />
                )}
              </div>
              <div className="step-content">
                <strong>{step.label}</strong>
                <small>{step.desc}</small>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function OrdersView({ orders, products, session }) {
  const displayName = session?.name || session?.username || 'Customer'
  const initials = displayName.slice(0, 2).toUpperCase()
  return (
    <main className="inner-page section-shell">
      <div className="page-intro split-intro">
        <div>
          <span className="eyebrow"><span /> Your purchases</span>
          <h1>Orders</h1>
          <p>Follow current deliveries or revisit the pieces you chose.</p>
        </div>
        <span className="profile-chip">
          <span>{initials}</span>
          <strong>{displayName}</strong>
        </span>
      </div>
      <div className="order-list">
        {orders.length === 0 && <p className="empty-dashboard-state">You have not placed an order yet.</p>}
        {orders.map((order) => (
          <article className="order-card" key={order.id}>
            <div className="order-top">
              <div><small>Order</small><strong>#{order.id}</strong></div>
              <div><small>Placed</small><strong>{new Date(order.createdAt).toLocaleDateString()}</strong></div>
              <div><small>Total</small><strong>₹{(order.totalAmount / 100).toFixed(2)}</strong></div>
              <span className={`status-pill ${order.status === 'DELIVERED' ? 'delivered' : ''}`}>
                <i />{order.status.replace('_', ' ')}
              </span>
            </div>
            <div className="order-body">
              <div className="order-items-preview">
                {order.items.map((item) => {
                  const product = products.find((entry) => entry.id === String(item.productId))
                  return (
                    <div key={item.productId} className="order-item-detail">
                      {product && (
                        <span className="order-thumb-mini" style={{ '--product-bg': product.color, '--product-accent': product.accent }}>
                          <ProductVisual type={product.visual} />
                        </span>
                      )}
                      <div className="order-item-info">
                        <strong>{product?.name || `Product #${item.productId}`}</strong>
                        <small>{item.quantity} unit(s) · ₹{(item.price / 100).toFixed(2)} each</small>
                      </div>
                    </div>
                  )
                })}
              </div>
              <OrderTracker status={order.status} />
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}

function AccountView({ favoriteCount, session, orderCount, address, onEditAddress }) {
  const displayName = session?.name || session?.username || 'Customer'
  const initials = displayName.slice(0, 2).toUpperCase()
  return (
    <main className="inner-page section-shell">
      <div className="page-intro">
        <span className="eyebrow"><span /> Your space</span>
        <h1>Hello, {displayName}.</h1>
        <p>Manage your profile, saved pieces, and delivery addresses.</p>
      </div>
      <section className="account-grid">
        <article className="profile-card">
          <div className="large-avatar">{initials}</div>
          <div>
            <h2>{displayName}</h2>
            <p>{session?.email || session?.username || ''}</p>
            <span>Customer account</span>
          </div>
        </article>
        <div className="account-stats-row">
          <article className="account-stat">
            <span className="stat-icon"><Icon name="bag" /></span>
            <strong>{orderCount}</strong>
            <p>Orders placed</p>
            <small>Across your Northstar account</small>
          </article>
          <article className="account-stat">
            <span className="stat-icon"><Icon name="heart" /></span>
            <strong>{favoriteCount}</strong>
            <p>Saved pieces</p>
            <small>Your personal shortlist</small>
          </article>
        </div>

        {/* Dynamic Delivery Address Card */}
        <article className={`address-card ${!address ? 'empty' : ''}`}>
          <div className="address-card-header">
            <span className="eyebrow"><span /> Default address</span>
            {address?.type && <span className="address-type-pill">{address.type}</span>}
          </div>
          {address ? (
            <>
              <h3>{address.name}</h3>
              <p>
                {address.street}<br />
                {address.city}, {address.state} {address.zipcode}<br />
                {address.phone && <small style={{ color: 'var(--muted)', display: 'block', marginTop: '4px' }}>Phone: {address.phone}</small>}
              </p>
              <button className="text-button" onClick={onEditAddress}>
                Edit address <Icon name="arrow" />
              </button>
            </>
          ) : (
            <div className="address-empty-state">
              <span className="address-empty-icon"><Icon name="mapPin" size={24} /></span>
              <h3>No address added yet</h3>
              <p>Add your shipping address so you are ready for quick, seamless checkouts.</p>
              <button className="secondary-button" style={{ marginTop: '8px' }} onClick={onEditAddress}>
                <Icon name="plus" size={14} /> Add delivery address
              </button>
            </div>
          )}
        </article>

        <article className="preferences-card">
          <span className="eyebrow"><span /> Preferences</span>
          <h3>Stay in the loop</h3>
          <label><span><strong>Order updates</strong><small>Delivery and purchase notifications</small></span><input type="checkbox" defaultChecked /></label>
          <label><span><strong>Product notes</strong><small>Occasional stories and new releases</small></span><input type="checkbox" /></label>
        </article>
      </section>
    </main>
  )
}

function SearchOverlay({ open, products, onClose, onSelect }) {
  const [query, setQuery] = useState('')
  const closeSearch = () => { setQuery(''); onClose() }
  const results = query.length > 1 ? products.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase())) : []
  if (!open) return null
  return (
    <div className="search-overlay">
      <div className="search-panel"><div className="search-field"><Icon name="search" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search for something thoughtful..." /><button className="icon-button" onClick={closeSearch}><Icon name="close" /></button></div>{query.length < 2 ? <p className="search-hint">Try “lamp”, “audio”, or “travel”</p> : <div className="search-results">{results.length ? results.map((product) => <button key={product.id} onClick={() => { onSelect(product); closeSearch() }}><span className="search-thumb" style={{ '--product-bg': product.color, '--product-accent': product.accent }}><ProductVisual type={product.visual} /></span><span><strong>{product.name}</strong><small>{product.category} · ₹{product.price.toLocaleString()}</small></span><Icon name="chevron" /></button>) : <p>No pieces found for “{query}”.</p>}</div>}</div>
    </div>
  )
}

function CheckoutModal({ open, total, address, onEditAddress, onClose, onComplete, processing }) {
  if (!open) return null
  return (
    <div className="modal-backdrop">
      <section className="checkout-modal" role="dialog" aria-modal="true">
        <button className="modal-close icon-button" disabled={processing} onClick={onClose}>
          <Icon name="close" />
        </button>
        <span className="checkout-icon"><Icon name="shield" size={28} /></span>
        <span className="eyebrow"><span /> Secure checkout</span>
        <h2>Ready to place your order?</h2>
        <p>Your order will be created through the gateway, then Razorpay will open to securely collect payment.</p>

        {address ? (
          <div className="checkout-address-box">
            <div className="checkout-address-meta">
              <span className="address-badge-line"><Icon name="mapPin" size={13} /> Delivering to ({address.type || 'Home'})</span>
              <strong>{address.name}</strong>
              <small>{address.street}, {address.city}, {address.state} - {address.zipcode}</small>
            </div>
            <button type="button" className="text-button" onClick={onEditAddress}>
              Change
            </button>
          </div>
        ) : null}

        <div className="checkout-total"><span>Order total</span><strong>₹{total.toFixed(2)}</strong></div>
        <button className="primary-button" disabled={processing} onClick={onComplete}>
          {processing ? 'Preparing Razorpay…' : 'Continue to Razorpay'} <Icon name="arrow" />
        </button>
        <small>Payment details are handled directly by Razorpay.</small>
      </section>
    </div>
  )
}

function ProductEditorModal({ open, onClose, onSave, saving, initialData = null }) {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price != null ? String(initialData.price) : '',
    stockQuantity: initialData?.stock != null ? String(initialData.stock) : (initialData?.stockQuantity != null ? String(initialData.stockQuantity) : ''),
    category: initialData?.category || '',
    imageUrl: initialData?.imageUrl || '',
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price != null ? String(initialData.price) : '',
        stockQuantity: initialData.stock != null ? String(initialData.stock) : (initialData.stockQuantity != null ? String(initialData.stockQuantity) : ''),
        category: initialData.category || '',
        imageUrl: initialData.imageUrl || '',
      })
    } else {
      setForm({ name: '', description: '', price: '', stockQuantity: '', category: '', imageUrl: '' })
    }
    setUploadError('')
    setUploadingImage(false)
  }, [initialData, open])

  if (!open) return null

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP, etc.).')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB. Please choose a smaller photo.')
      return
    }

    setUploadingImage(true)
    setUploadError('')

    try {
      if (initialData?.id) {
        // Enforce 1 photo per product: backend replaces old photo and deletes old file
        const updatedProduct = await storefrontService.uploadProductImage(initialData.id, file)
        setForm((prev) => ({ ...prev, imageUrl: updatedProduct.imageUrl }))
      } else {
        // Product creation draft: upload standalone image
        const res = await storefrontService.uploadStandaloneImage(file)
        setForm((prev) => ({ ...prev, imageUrl: res.imageUrl }))
      }
    } catch (err) {
      setUploadError(err.message || 'Failed to upload photo. Please try again.')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemovePhoto = () => {
    setForm((prev) => ({ ...prev, imageUrl: '' }))
    setUploadError('')
  }

  const submit = (event) => {
    event.preventDefault()
    onSave({ ...form, price: Number(form.price), stockQuantity: Number(form.stockQuantity) })
  }

  return (
    <div className="modal-backdrop">
      <form className="product-editor-modal" onSubmit={submit}>
        <button type="button" className="modal-close icon-button" onClick={onClose}><Icon name="close" /></button>
        <span className="eyebrow"><span /> Seller catalog</span>
        <h2>{initialData ? 'Edit product' : 'Add a product'}</h2>
        <div className="form-row">
          <label>
            Product name
            <input
              required
              placeholder="e.g. Arc Desk Lamp"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </label>
          <label>
            Category
            <select
              required
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
            >
              <option value="" disabled>Select a category…</option>
              <option value="Workspace">Desk & Lighting (Workspace)</option>
              <option value="Audio">Headphones & Audio (Audio)</option>
              <option value="Home">Home & Kitchen (Home)</option>
              <option value="Travel">Bags & Accessories (Travel)</option>
              <option value="Electronics">Phones & Tech (Electronics)</option>
              <option value="Lifestyle">Lifestyle & Wellness</option>
              {form.category && !['Workspace', 'Audio', 'Home', 'Travel', 'Electronics', 'Lifestyle'].includes(form.category) && (
                <option value={form.category}>{form.category}</option>
              )}
            </select>
          </label>
        </div>
        <label>Description<textarea maxLength="2000" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <div className="form-row">
          <label>Price (INR)<input required min="0.01" step="0.01" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label>
          <label>Stock quantity<input required min="0" type="number" value={form.stockQuantity} onChange={(event) => setForm({ ...form, stockQuantity: event.target.value })} /></label>
        </div>

        {/* 1 Photo Per Product Uploader */}
        <div className="product-photo-section">
          <div className="photo-section-header">
            <span className="photo-field-title">
              Product Photo <small>(Strictly 1 photo per product)</small>
            </span>
            {form.imageUrl && (
              <span className="photo-attached-badge">
                <Icon name="check" size={13} /> 1 photo active
              </span>
            )}
          </div>

          {form.imageUrl ? (
            <div className="photo-preview-card">
              <div className="photo-preview-thumb">
                <img
                  src={form.imageUrl}
                  alt="Product preview"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
              <div className="photo-preview-info">
                <strong>Photo Attached</strong>
                <small>This photo represents your product across the marketplace.</small>
                <div className="photo-preview-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    style={{ padding: '6px 12px', fontSize: '11.5px' }}
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Icon name="edit" size={13} /> {uploadingImage ? 'Replacing…' : 'Replace photo'}
                  </button>
                  <button
                    type="button"
                    className="text-button remove-photo-btn"
                    disabled={uploadingImage}
                    onClick={handleRemovePhoto}
                  >
                    <Icon name="trash" size={13} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`photo-upload-dropzone ${uploadingImage ? 'uploading' : ''}`}
              onClick={() => !uploadingImage && fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  fileInputRef.current?.click()
                }
              }}
            >
              <div className="dropzone-icon">
                <Icon name="upload" size={24} />
              </div>
              <div className="dropzone-text">
                <strong>{uploadingImage ? 'Uploading product photo…' : 'Upload product photo'}</strong>
                <small>Click to browse. JPG, PNG, WebP up to 10MB. (Single photo policy)</small>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoUpload}
          />

          {uploadError && <p className="photo-upload-error">{uploadError}</p>}
        </div>

        <button className="primary-button" disabled={saving || uploadingImage} style={{ marginTop: '12px' }}>
          {saving ? 'Saving…' : initialData ? 'Save changes' : 'Create product'}<Icon name="arrow" />
        </button>
      </form>
    </div>
  )
}

function RestockModal({ open, product, onClose, onRestock, loading }) {
  const [quantity, setQuantity] = useState(10)
  if (!open || !product) return null
  const submit = (e) => {
    e.preventDefault()
    onRestock(product.id, Number(quantity))
  }
  return (
    <div className="modal-backdrop">
      <form className="product-editor-modal" style={{ maxWidth: '440px' }} onSubmit={submit}>
        <button type="button" className="modal-close icon-button" onClick={onClose}><Icon name="close" /></button>
        <span className="eyebrow"><span /> Inventory restock</span>
        <h2>Restock {product.name}</h2>
        <p style={{ margin: '6px 0 16px', color: 'var(--muted)', fontSize: '12px' }}>
          Current stock: <strong>{product.stock ?? product.stockQuantity ?? 0} units</strong>
        </p>
        <label>Units to add
          <input required min="1" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </label>
        <div style={{ display: 'flex', gap: '8px', margin: '12px 0 16px' }}>
          <button type="button" className="secondary-button" onClick={() => setQuantity(10)}>+10</button>
          <button type="button" className="secondary-button" onClick={() => setQuantity(25)}>+25</button>
          <button type="button" className="secondary-button" onClick={() => setQuantity(50)}>+50</button>
        </div>
        <button className="primary-button" disabled={loading}>
          {loading ? 'Restocking…' : 'Add to inventory'} <Icon name="arrow" />
        </button>
      </form>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(() => authService.getSession())
  const [userAddress, setUserAddress] = useState(() => {
    const sess = authService.getSession()
    if (!sess?.userId) return null
    try {
      const saved = localStorage.getItem(`northstar_user_address_${sess.userId}`)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [isCheckoutAddressGate, setIsCheckoutAddressGate] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)
  const [products, setProducts] = useState(catalogProducts)
  const [orders, setOrders] = useState([])
  const [sellerOrders, setSellerOrders] = useState([])
  const [view, setView] = useState('home')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [cart, setCart] = useState([])
  const [favorites, setFavorites] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutProcessing, setCheckoutProcessing] = useState(false)
  const [productEditorOpen, setProductEditorOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [restockingProduct, setRestockingProduct] = useState(null)
  const [restockLoading, setRestockLoading] = useState(false)
  const [authRequest, setAuthRequest] = useState(null)
  const [savingProduct, setSavingProduct] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (session?.userId) {
      try {
        const stored = localStorage.getItem(`northstar_user_address_${session.userId}`)
        if (stored) {
          setUserAddress(JSON.parse(stored))
        } else {
          storefrontService.getUserProfile(session.userId)
            .then((profile) => {
              if (profile?.address?.street && profile?.address?.city) {
                const fetched = {
                  name: (profile.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : session.name) || 'Home',
                  phone: profile.phone || '',
                  street: profile.address.street,
                  city: profile.address.city,
                  state: profile.address.state,
                  zipcode: profile.address.zipcode,
                  country: profile.address.country || 'India',
                  type: 'Home',
                }
                setUserAddress(fetched)
                localStorage.setItem(`northstar_user_address_${session.userId}`, JSON.stringify(fetched))
              } else {
                setUserAddress(null)
              }
            })
            .catch(() => setUserAddress(null))
        }
      } catch {
        setUserAddress(null)
      }
    } else {
      setUserAddress(null)
    }
  }, [session?.userId])

  useEffect(() => {
    const handleUnauthorized = () => setSession(null)
    window.addEventListener('northstar:unauthorized', handleUnauthorized)

    // Periodic heartbeat to proactively refresh tokens before expiration
    const heartbeat = setInterval(() => {
      const current = authService.getSession()
      if (current?.refreshToken && current.expiresAt <= Date.now() + 60000) {
        authService.refreshSession().then((refreshed) => {
          if (refreshed) setSession(refreshed)
        })
      }
    }, 30000)

    return () => {
      window.removeEventListener('northstar:unauthorized', handleUnauthorized)
      clearInterval(heartbeat)
    }
  }, [])

  useEffect(() => {
    let active = true
    const loadRoleData = async () => {
      try {
        if (!session) {
          const productData = await storefrontService.listProducts().catch(() => [])
          if (!active) return
          if (Array.isArray(productData) && productData.length > 0) {
            setProducts(productData)
          }
          setOrders([])
          setCart([])
        } else if (session.role === 'USER') {
          const [productData, orderData, cartData] = await Promise.all([
            storefrontService.listProducts().catch(() => []),
            storefrontService.listOrders().catch(() => []),
            storefrontService.getCart().catch(() => ({ items: [] })),
          ])
          if (!active) return
          if (Array.isArray(productData) && productData.length > 0) {
            setProducts(productData)
          }
          setOrders(Array.isArray(orderData) ? orderData : [])
          const currentProducts = (Array.isArray(productData) && productData.length > 0) ? productData : catalogProducts
          setCart((cartData?.items ?? []).map((item) => {
            const product = currentProducts.find((entry) => entry.id === String(item.productId))
            return product ? { ...product, quantity: item.quantity } : null
          }).filter(Boolean))
        } else if (session.role === 'SELLER') {
          const [productsRes, ordersRes] = await Promise.allSettled([
            storefrontService.listSellerProducts(),
            storefrontService.listSellerOrders(),
          ])
          if (!active) return
          if (productsRes.status === 'fulfilled' && Array.isArray(productsRes.value)) {
            setProducts(productsRes.value)
          }
          if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)) {
            setSellerOrders(ordersRes.value)
          }
        }
      } catch (error) {
        if (active) setToast(error.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadRoleData()
    return () => { active = false }
  }, [session])

  useEffect(() => { if (!toast) return undefined; const timer = window.setTimeout(() => setToast(''), 2400); return () => window.clearTimeout(timer) }, [toast])

  const navigate = (nextView, category = 'All') => {
    setView(nextView)
    if (category) setSelectedCategory(category)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const requestAuthentication = (mode = 'login', role = 'CUSTOMER') => setAuthRequest({ mode, role })
  const navigateSafely = (nextView, category = 'All') => {
    if (!session && (nextView === 'orders' || nextView === 'account')) {
      requestAuthentication('login')
      return
    }
    navigate(nextView, category)
  }
  const logout = () => { authService.logout(); setLoading(true); setSession(null); setProducts([]); setCart([]); setOrders([]); setSellerOrders([]); setView('home') }
  const refreshCart = async () => {
    const cartData = await storefrontService.getCart()
    setCart((cartData.items ?? []).map((item) => {
      const product = products.find((entry) => entry.id === String(item.productId))
      return product ? { ...product, quantity: item.quantity } : null
    }).filter(Boolean))
  }
  const addToCart = async (product) => {
    if (!session) { requestAuthentication('login'); return }
    try { await storefrontService.addToCart(product.id); await refreshCart(); setToast(`${product.name} added to your cart`) }
    catch (error) { setToast(error.message) }
  }
  const changeQuantity = async (id, change) => {
    const item = cart.find((entry) => entry.id === id)
    if (!item) return
    try {
      const nextQuantity = item.quantity + change
      if (nextQuantity <= 0) await storefrontService.removeCartItem(id)
      else await storefrontService.updateCartQuantity(id, nextQuantity)
      await refreshCart()
    } catch (error) { setToast(error.message) }
  }
  const toggleFavorite = (id) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  const handleSaveAddress = async (newAddr) => {
    setSavingAddress(true)
    try {
      const userLookupId = session?.userId || session?.username || session?.email
      if (!userLookupId) throw new Error('Please sign in again before saving your address.')

      const profile = await storefrontService.getUserProfile(userLookupId)
      const nameParts = newAddr.name.split(/\s+/).filter(Boolean)
      await storefrontService.updateUserProfile(profile.id || userLookupId, {
        username: profile.username || session.username || session.email,
        firstName: profile.firstName || nameParts[0] || 'Customer',
        lastName: profile.lastName || nameParts.slice(1).join(' ') || 'Customer',
        email: profile.email || session.email || 'user@northstar.store',
        phone: newAddr.phone,
        password: 'Password123!',
        userRole: profile.userRole,
        address: {
          street: newAddr.street,
          city: newAddr.city,
          state: newAddr.state,
          zipcode: newAddr.zipcode,
          country: newAddr.country || 'India',
        },
      })

      setUserAddress(newAddr)
      localStorage.setItem(`northstar_user_address_${session.userId || userLookupId}`, JSON.stringify(newAddr))
      setAddressModalOpen(false)
      setToast('Delivery address saved')
      if (isCheckoutAddressGate) {
        setIsCheckoutAddressGate(false)
        setCheckoutOpen(true)
      }
    } catch (err) {
      setToast(err.message || 'Failed to save address')
    } finally {
      setSavingAddress(false)
    }
  }

  const startCheckout = () => {
    if (!session) {
      requestAuthentication('login')
      return
    }
    setCartOpen(false)
    if (!userAddress) {
      setIsCheckoutAddressGate(true)
      setAddressModalOpen(true)
    } else {
      setCheckoutOpen(true)
    }
  }

  const waitForPayment = async (orderId) => {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const payment = await storefrontService.getOrderPayment(orderId)
      if (payment.paymentId) return payment.paymentId
      await new Promise((resolve) => window.setTimeout(resolve, 700))
    }
    throw new Error('Payment preparation timed out. Please check your order and try again.')
  }

  const checkout = async () => {
    if (!session) { requestAuthentication('login'); return }
    if (!userAddress) {
      setCheckoutOpen(false)
      setIsCheckoutAddressGate(true)
      setAddressModalOpen(true)
      return
    }
    if (checkoutProcessing) return
    setCheckoutProcessing(true)
    try {
      const order = await storefrontService.createOrder()
      // Backend now clears the cart on order creation, sync the UI
      setCart([])
      const paymentId = await waitForPayment(order.id)
      const details = await storefrontService.getPaymentDetails(paymentId)
      setCheckoutOpen(false)
      await openRazorpayCheckout({
        details,
        customer: session,
        onDismiss: () => setToast('Payment was cancelled. Your order is still available in Orders.'),
        onSuccess: async (verification) => {
          try {
            await storefrontService.verifyPayment(verification)
            setOrders(await storefrontService.listOrders())
            setToast('Payment verified and order confirmed')
          } catch (error) { setToast(error.message) }
        },
      })
    } catch (error) {
      setToast(error.message)
    } finally {
      setCheckoutProcessing(false)
    }
  }

  const handleSaveSellerProduct = async (productData) => {
    setSavingProduct(true)
    try {
      let savedStorefront = {}
      try {
        const stored = localStorage.getItem('northstar_storefront_profile')
        if (stored) savedStorefront = JSON.parse(stored)
      } catch { }
      const payload = {
        ...productData,
        sellerName: productData.sellerName || savedStorefront.storeName || session?.name || "Aman Verma's Workshop"
      }
      if (editingProduct?.id) {
        await storefrontService.updateSellerProduct(editingProduct.id, payload)
        setToast('Product updated successfully')
      } else {
        await storefrontService.createSellerProduct(payload)
        setToast('Product created successfully')
      }
      setProducts(await storefrontService.listSellerProducts().catch(() => products))
      setProductEditorOpen(false)
      setEditingProduct(null)
    } catch (error) {
      setToast(error.message)
    } finally {
      setSavingProduct(false)
    }
  }

  const handleDeleteSellerProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product listing?')) return
    try {
      await storefrontService.deleteSellerProduct(productId)
      setProducts(await storefrontService.listSellerProducts().catch(() => products.filter((p) => p.id !== String(productId))))
      setToast('Product deactivated successfully')
    } catch (error) {
      setToast(error.message)
    }
  }

  const handleRestockProduct = async (productId, quantity) => {
    setRestockLoading(true)
    try {
      await storefrontService.restockProduct(productId, quantity)
      setProducts(await storefrontService.listSellerProducts().catch(() => products))
      setRestockingProduct(null)
      setToast(`Restocked ${quantity} unit(s) successfully`)
    } catch (error) {
      setToast(error.message)
    } finally {
      setRestockLoading(false)
    }
  }

  const updateSellerOrder = async (orderId, status) => {
    try {
      await storefrontService.updateSellerOrderStatus(orderId, status)
      setSellerOrders(await storefrontService.listSellerOrders().catch(() => sellerOrders))
      setToast(`Order #${orderId} marked ${status.toLowerCase()}`)
    } catch (error) {
      setToast(error.message)
    }
  }

  if (session?.role === 'ADMIN') return <div className="app-shell"><AdminDashboard orders={orders} notify={setToast} onLogout={logout} /><div className={`toast ${toast ? 'visible' : ''}`} role="status"><Icon name="check" size={16} />{toast}</div></div>

  if (session?.role === 'SELLER') {
    return (
      <div className="app-shell">
        {loading ? (
          <div className="loading-screen">
            <span className="brand-mark"><span /></span>
            <p>Opening seller workspace…</p>
          </div>
        ) : (
          <SellerDashboard
            products={products}
            orders={sellerOrders}
            notify={setToast}
            session={session}
            onLogout={logout}
            onAddProduct={() => { setEditingProduct(null); setProductEditorOpen(true) }}
            onEditProduct={(p) => { setEditingProduct(p); setProductEditorOpen(true) }}
            onDeleteProduct={handleDeleteSellerProduct}
            onRestockProduct={(p) => setRestockingProduct(p)}
            onUpdateOrder={updateSellerOrder}
          />
        )}
        <ProductEditorModal
          open={productEditorOpen}
          initialData={editingProduct}
          saving={savingProduct}
          onClose={() => { setProductEditorOpen(false); setEditingProduct(null) }}
          onSave={handleSaveSellerProduct}
        />
        <RestockModal
          open={Boolean(restockingProduct)}
          product={restockingProduct}
          loading={restockLoading}
          onClose={() => setRestockingProduct(null)}
          onRestock={handleRestockProduct}
        />
        <div className={`toast ${toast ? 'visible' : ''}`} role="status">
          <Icon name="check" size={16} />{toast}
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="announcement">Complimentary delivery on orders over ₹750 <span>Explore the collection →</span></div>
      <Header activeView={view} cartCount={cartCount} onNavigate={navigateSafely} onCartOpen={() => session ? setCartOpen(true) : requestAuthentication('login')} onSearchOpen={() => setSearchOpen(true)} session={session} onLogin={() => requestAuthentication('login')} onBecomeSeller={() => requestAuthentication('signup', 'SELLER')} onLogout={logout} />
      {loading ? <div className="loading-screen"><span className="brand-mark"><span /></span><p>Curating the collection…</p></div> : (
        <>
          {view === 'home' && <HomeView products={products} favorites={favorites} onFavorite={toggleFavorite} onSelect={setSelectedProduct} onAdd={addToCart} onNavigate={navigateSafely} />}
          {view === 'shop' && (
            <ShopView
              products={products}
              favorites={favorites}
              onFavorite={toggleFavorite}
              onSelect={setSelectedProduct}
              onAdd={addToCart}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          )}
          {view === 'orders' && session && <OrdersView orders={orders} products={products} session={session} />}
          {view === 'account' && session && (
            <AccountView
              favoriteCount={favorites.length}
              orderCount={orders.length}
              session={session}
              address={userAddress}
              onEditAddress={() => { setIsCheckoutAddressGate(false); setAddressModalOpen(true) }}
            />
          )}
        </>
      )}
      <Footer onNavigate={navigate} />
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={addToCart} />
      <CartDrawer open={cartOpen} items={cart} onClose={() => setCartOpen(false)} onQuantity={changeQuantity} onCheckout={startCheckout} />
      <SearchOverlay open={searchOpen} products={products} onClose={() => setSearchOpen(false)} onSelect={setSelectedProduct} />
      <CheckoutModal
        open={checkoutOpen}
        total={cartTotal}
        address={userAddress}
        onEditAddress={() => { setCheckoutOpen(false); setIsCheckoutAddressGate(true); setAddressModalOpen(true) }}
        processing={checkoutProcessing}
        onClose={() => setCheckoutOpen(false)}
        onComplete={checkout}
      />
      <AddressModal
        open={addressModalOpen}
        initialAddress={userAddress}
        isCheckoutGate={isCheckoutAddressGate}
        defaultName={session?.name}
        saving={savingAddress}
        onClose={() => { setAddressModalOpen(false); setIsCheckoutAddressGate(false) }}
        onSave={handleSaveAddress}
      />
      {authRequest && <AuthPage initialMode={authRequest.mode} initialRole={authRequest.role} onClose={() => setAuthRequest(null)} onAuthenticated={(authenticatedSession) => { setLoading(true); setAuthRequest(null); setSession(authenticatedSession) }} />}
      <div className={`toast ${toast ? 'visible' : ''}`} role="status"><Icon name="check" size={16} />{toast}</div>
      <nav className="mobile-nav" aria-label="Mobile navigation"><button className={view === 'home' ? 'active' : ''} onClick={() => navigate('home')}><span>⌂</span>Home</button><button className={view === 'shop' ? 'active' : ''} onClick={() => navigate('shop')}><Icon name="search" size={18} />Shop</button>{session ? <><button className={view === 'orders' ? 'active' : ''} onClick={() => navigate('orders')}><Icon name="truck" size={18} />Orders</button><button className={view === 'account' ? 'active' : ''} onClick={() => navigate('account')}><Icon name="user" size={18} />Profile</button></> : <><button onClick={() => requestAuthentication('signup', 'SELLER')}><Icon name="store" size={18} />Sell</button><button onClick={() => requestAuthentication('login')}><Icon name="user" size={18} />Sign in</button></>}</nav>
    </div>
  )
}
