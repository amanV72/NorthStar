import { useMemo, useState } from 'react'
import { Icon } from './Icons'
import { ProductVisual } from './ProductVisual'
import { categories } from '../data/catalog'

const adminMetrics = [
  { label: 'Gross revenue', value: '₹128.4k', change: '+12.8%', icon: 'trend', tone: 'green' },
  { label: 'Total orders', value: '1,842', change: '+8.2%', icon: 'bag', tone: 'blue' },
  { label: 'Active sellers', value: '126', change: '+6 this week', icon: 'store', tone: 'orange' },
  { label: 'Customers', value: '8,492', change: '+14.3%', icon: 'user', tone: 'purple' },
]

const adminOrders = [
  ['#NS-4924', 'Maya Chen', 'Still Pour Set', '₹7,400', 'Paid'],
  ['#NS-4923', 'Theo Martin', 'Arc Desk Lamp', '₹12,900', 'Processing'],
  ['#NS-4922', 'Priya Shah', 'Quiet Form Headphones', '₹24,900', 'Paid'],
  ['#NS-4921', 'Leo Williams', 'Contour Carryall', '₹16,400', 'Refunded'],
]

const serviceHealth = [
  ['Gateway', '99.99%', 'Healthy'], ['Orders', '99.98%', 'Healthy'], ['Payments', '99.96%', 'Healthy'],
  ['Inventory', '99.91%', 'Healthy'], ['Notifications', '98.82%', 'Degraded'], ['Users', '99.97%', 'Healthy'],
]

function PortalSidebar({ portal, activeTab = 'Overview', onSelectTab, onLogout, orderBadgeCount = 0 }) {
  const adminItems = [['grid', 'Overview'], ['bag', 'Orders'], ['store', 'Sellers'], ['user', 'Customers'], ['box', 'Catalog']]
  const sellerItems = [['grid', 'Overview'], ['bag', 'Orders'], ['box', 'Products'], ['trend', 'Analytics'], ['store', 'Storefront']]
  const items = portal === 'admin' ? adminItems : sellerItems

  return (
    <aside className="portal-sidebar">
      <div className="portal-identity">
        <span className="brand-mark"><span /></span>
        <div>
          <strong>northstar</strong>
          <small>{portal} portal</small>
        </div>
      </div>
      <nav>
        {items.map(([icon, label]) => (
          <button
            className={activeTab === label ? 'active' : ''}
            key={label}
            onClick={() => onSelectTab && onSelectTab(label)}
          >
            <Icon name={icon} size={18} />
            {label}
            {label === 'Orders' && orderBadgeCount > 0 && <i>{orderBadgeCount}</i>}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button onClick={onLogout}>← Sign out</button>
        <div className="portal-user">
          <span>{portal === 'admin' ? 'AN' : 'SL'}</span>
          <div>
            <strong>{portal === 'admin' ? 'Administrator' : 'Seller account'}</strong>
            <small>{portal === 'admin' ? 'Platform admin' : 'Verified merchant'}</small>
          </div>
        </div>
      </div>
    </aside>
  )
}

function MetricCards({ metrics }) {
  return (
    <div className="metric-grid">
      {metrics.map((metric) => (
        <article className="metric-card" key={metric.label}>
          <div className={`metric-icon ${metric.tone}`}>
            <Icon name={metric.icon} size={19} />
          </div>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          <small><b>{metric.change}</b> vs last month</small>
        </article>
      ))}
    </div>
  )
}

const getOrderRevenue = (order) => Number(order.sellerTotal ?? order.totalAmount ?? 0) / 100

const getOrderDate = (order) => {
  const value = order.createdAt ?? order.orderDate ?? order.createdDate ?? order.date ?? order.updatedAt
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const formatRevenue = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
}).format(value)

function RevenueChart({ seller = false, orders = [] }) {
  const [period, setPeriod] = useState('12m')
  const sellerChart = useMemo(() => {
    if (!seller) return null

    const now = new Date()
    const datedOrders = orders
      .map((order) => ({ date: getOrderDate(order), revenue: getOrderRevenue(order) }))
      .filter((order) => order.date && Number.isFinite(order.revenue))

    if (period === '30d') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29)
      const values = Array(6).fill(0)

      datedOrders.forEach(({ date, revenue }) => {
        if (date < start || date > now) return
        const dayOffset = Math.floor((date - start) / 86400000)
        values[Math.min(Math.floor(dayOffset / 5), values.length - 1)] += revenue
      })

      return {
        values,
        labels: values.map((_, index) => {
          const labelDate = new Date(start)
          labelDate.setDate(start.getDate() + (index * 5))
          return labelDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        }),
      }
    }

    const months = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 11 + index, 1)
      return { year: date.getFullYear(), month: date.getMonth(), date, revenue: 0 }
    })

    datedOrders.forEach(({ date, revenue }) => {
      const bucket = months.find((month) => month.year === date.getFullYear() && month.month === date.getMonth())
      if (bucket) bucket.revenue += revenue
    })

    return {
      values: months.map((month) => month.revenue),
      labels: months.map((month) => month.date.toLocaleDateString('en-IN', { month: 'short' })),
    }
  }, [orders, period, seller])

  const values = sellerChart?.values ?? [45, 56, 49, 67, 58, 72, 69, 82, 77, 91, 86, 98]
  const maxValue = Math.max(...values, 0)
  const bars = seller ? values.map((value) => maxValue > 0 ? (value / maxValue) * 100 : 0) : values
  const chartTotal = seller ? values.reduce((total, value) => total + value, 0) : 128430
  const labels = sellerChart?.labels ?? ['Dec', 'Mar', 'Jun', 'Sep', 'Nov']
  const visibleLabelIndexes = seller
    ? (period === '12m' ? [0, 3, 6, 9, 11] : [0, 2, 4, 5])
    : labels.map((_, index) => index)

  return (
    <article className="dashboard-card chart-card">
      <div className="card-heading">
        <div>
          <span>{seller ? 'Sales performance' : 'Revenue overview'}</span>
          <strong>{formatRevenue(chartTotal)}</strong>
        </div>
        <select
          aria-label="Chart period"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="12m">Last 12 months</option>
          <option value="30d">Last 30 days</option>
        </select>
      </div>
      <div
        className="bar-chart"
        aria-label="Revenue bar chart"
        style={{ gridTemplateColumns: `repeat(${bars.length}, 1fr)` }}
      >
        {bars.map((height, index) => (
          <div key={index}>
            <span
              title={seller ? `${labels[index]}: ${formatRevenue(values[index])}` : undefined}
              aria-label={seller ? `${labels[index]} revenue ${formatRevenue(values[index])}` : undefined}
              style={{ height: `${height}%` }}
              className={index === bars.length - 1 ? 'current' : ''}
            />
          </div>
        ))}
      </div>
      <div
        className="chart-labels"
        style={{ gridTemplateColumns: `repeat(${bars.length}, 1fr)` }}
      >
        {visibleLabelIndexes.map((index) => (
          <span key={`${labels[index]}-${index}`} style={{ gridColumn: index + 1 }}>
            {labels[index]}
          </span>
        ))}
      </div>
    </article>
  )
}

function AdminDashboard({ notify, onLogout }) {
  return (
    <main className="portal-layout">
      <PortalSidebar portal="admin" onLogout={onLogout} />
      <section className="portal-main">
        <header className="portal-header">
          <div>
            <span className="portal-kicker">Platform overview</span>
            <h1>Good morning, Aman.</h1>
            <p>Here’s what is happening across Northstar today.</p>
          </div>
          <div className="portal-actions">
            <button className="icon-button"><Icon name="search" /></button>
            <button className="secondary-button" onClick={() => notify('Demo report prepared')}>Export report</button>
          </div>
        </header>
        <MetricCards metrics={adminMetrics} />
        <div className="dashboard-split">
          <RevenueChart />
          <article className="dashboard-card health-card">
            <div className="card-heading">
              <div>
                <span>Service health</span>
                <small>Live platform status</small>
              </div>
              <span className="live-pill"><i /> Operational</span>
            </div>
            <div className="service-list">
              {serviceHealth.map(([name, uptime, state]) => (
                <div key={name}>
                  <span><i className={state === 'Degraded' ? 'warn' : ''} />{name}</span>
                  <small>{uptime}</small>
                  <b className={state === 'Degraded' ? 'warn' : ''}>{state}</b>
                </div>
              ))}
            </div>
            <button className="text-button">View observability <Icon name="arrow" size={15} /></button>
          </article>
        </div>
        <div className="dashboard-lower">
          <article className="dashboard-card table-card">
            <div className="card-heading">
              <div>
                <span>Recent orders</span>
                <small>Latest activity across all sellers</small>
              </div>
              <button className="text-button">View all</button>
            </div>
            <div className="data-table">
              <div className="table-row table-head">
                <span>Order</span>
                <span>Customer</span>
                <span>Product</span>
                <span>Total</span>
                <span>Status</span>
              </div>
              {adminOrders.map((row) => (
                <div className="table-row" key={row[0]}>
                  {row.map((cell, index) => (
                    <span key={cell} className={index === 4 ? `table-status ${cell.toLowerCase()}` : ''}>
                      {cell}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </article>
          <article className="dashboard-card approvals-card">
            <div className="card-heading">
              <div>
                <span>Seller approvals</span>
                <small>3 require review</small>
              </div>
            </div>
            {[['WL', 'Woven Labs', 'Home goods'], ['NB', 'Northbound', 'Travel'], ['CA', 'Common Assembly', 'Workspace']].map(([initials, name, type]) => (
              <div className="approval" key={name}>
                <span>{initials}</span>
                <div>
                  <strong>{name}</strong>
                  <small>{type}</small>
                </div>
                <button onClick={() => notify(`${name} review opened`)}>Review</button>
              </div>
            ))}
          </article>
        </div>
      </section>
    </main>
  )
}

function SellerOrdersView({ orders = [], onUpdateOrder, notify }) {
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = !searchQuery ||
        String(order.orderId || order.id).includes(searchQuery) ||
        String(order.userId || order.customerId || '').toLowerCase().includes(searchLower)
      return matchesStatus && matchesSearch
    })
  }, [orders, statusFilter, searchQuery])

  return (
    <div className="seller-subview">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '6px' }}>
        <div className="seller-search-bar">
          <Icon name="search" size={16} />
          <input
            placeholder="Search orders by Order ID or customer…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-pills">
          {['ALL', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].map((status) => (
            <button
              className={statusFilter === status ? 'active' : ''}
              key={status}
              onClick={() => setStatusFilter(status)}
            >
              {status === 'ALL' ? 'All Orders' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <p className="result-count">{filteredOrders.length} order(s) found</p>

      {filteredOrders.length === 0 ? (
        <div className="dashboard-card" style={{ padding: '40px', textAlign: 'center' }}>
          <p className="empty-dashboard-state">No orders match the selected criteria.</p>
        </div>
      ) : (
        <div className="order-list">
          {filteredOrders.map((order) => {
            const orderId = order.orderId || order.id
            const total = (Number(order.sellerTotal ?? order.totalAmount ?? 0) / 100).toFixed(2)
            const nextStatus = order.status === 'CONFIRMED' ? 'SHIPPED' : order.status === 'SHIPPED' ? 'DELIVERED' : null

            return (
              <article className="order-item-card" key={orderId}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid #eff0ed', paddingBottom: '10px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <strong style={{ fontSize: '13px', letterSpacing: '-.02em' }}>Order #{orderId}</strong>
                    <small style={{ color: 'var(--muted)', fontSize: '11px' }}>Placed {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}</small>
                  </div>
                  <span className={`status-pill ${order.status === 'DELIVERED' ? 'delivered' : ''}`} style={{ fontSize: '9px', padding: '3px 9px' }}>
                    <i />{order.status.replace('_', ' ')}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <small style={{ color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em', fontSize: '9px', fontWeight: 700 }}>
                      Items to fulfill ({order.items?.length || 0}):
                    </small>
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                        <span style={{ fontWeight: 600 }}>Product #{item.productId}</span>
                        <span style={{ color: 'var(--muted)' }}>×</span>
                        <strong style={{ background: '#f0f2ee', padding: '1px 6px', borderRadius: '4px', fontSize: '11px' }}>{item.quantity}</strong>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    {nextStatus && (
                      <button
                        className="primary-button"
                        style={{ padding: '6px 14px', fontSize: '11px' }}
                        onClick={() => onUpdateOrder(orderId, nextStatus)}
                      >
                        Mark as {nextStatus.toLowerCase()}
                      </button>
                    )}
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: 'var(--muted)', marginRight: '6px' }}>
                        {order.items?.length === 1 && `₹${(Number(order.items[0].price) / 100).toFixed(2)} each · `}
                      </span>
                      <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>Total: ₹{total}</strong>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SellerProductsView({ products = [], onAddProduct, onEditProduct, onDeleteProduct, onRestockProduct }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = !searchQuery ||
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(p.id).includes(searchQuery)
      return matchesSearch
    })
  }, [products, searchQuery])

  return (
    <div className="seller-subview">
      <div style={{ marginBottom: '16px', width: '100%' }}>
        <div className="seller-search-bar">
          <Icon name="search" size={16} />
          <input
            placeholder="Search products by title, SKU, or category…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <p className="result-count">{filteredProducts.length} product listing(s)</p>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="dashboard-card" style={{ padding: '40px', textAlign: 'center' }}>
          <p className="empty-dashboard-state">No products found. Start listing your items!</p>
        </div>
      ) : (
        <div className="dashboard-card products-card">
          {filteredProducts.map((product) => {
            const stock = product.stock ?? product.stockQuantity ?? 0
            const stockStatus = stock <= 0 ? 'Out of stock' : stock < 10 ? 'Low stock' : 'In stock'
            const statusClass = stock <= 0 ? 'warn' : stock < 10 ? 'warn' : ''

            return (
              <div className="seller-product-row" key={product.id} style={{ gridTemplateColumns: '48px 1fr 100px 90px auto', gap: '16px' }}>
                <span className="mini-product" style={{ '--product-bg': product.color, '--product-accent': product.accent }}>
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="mini-product-img"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const fb = e.currentTarget.parentElement?.querySelector('.mini-fallback')
                        if (fb) fb.style.display = 'grid'
                      }}
                    />
                  ) : null}
                  <span className="mini-fallback" style={product.imageUrl ? { display: 'none' } : {}}>
                    <ProductVisual type={product.visual} />
                  </span>
                </span>
                <div>
                  <strong>{product.name}</strong>
                  <small>{product.category} · SKU #{product.id}</small>
                </div>
                <div>
                  <span className={`listing-status ${statusClass}`} style={{ fontSize: '10px' }}>
                    <i /> {stockStatus} ({stock})
                  </span>
                </div>
                <b style={{ fontSize: '12px' }}>₹{Number(product.price).toLocaleString()}</b>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="secondary-button"
                    style={{ padding: '6px 10px', fontSize: '10px' }}
                    onClick={() => onRestockProduct(product)}
                  >
                    Restock
                  </button>
                  <button
                    className="secondary-button"
                    style={{ padding: '6px 10px', fontSize: '10px' }}
                    onClick={() => onEditProduct(product)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-button"
                    style={{ color: '#c04a3d', padding: '6px 8px', fontSize: '10px' }}
                    onClick={() => onDeleteProduct(product.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SellerAnalyticsView({ products = [], orders = [] }) {
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.sellerTotal ?? o.totalAmount ?? 0), 0) / 100
  const avgOrderValue = orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00'
  const fulfilledCount = orders.filter((o) => o.status === 'DELIVERED').length
  const fulfillmentRate = orders.length > 0 ? Math.round((fulfilledCount / orders.length) * 100) : 100

  const analyticsMetrics = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, change: '+18.2%', icon: 'trend', tone: 'green' },
    { label: 'Completed Orders', value: String(fulfilledCount), change: `${fulfillmentRate}% rate`, icon: 'bag', tone: 'blue' },
    { label: 'Avg. Order Value', value: `₹${avgOrderValue}`, change: '+5.4%', icon: 'grid', tone: 'orange' },
    { label: 'Active Catalog', value: String(products.length), change: 'Pieces listed', icon: 'box', tone: 'purple' },
  ]

  return (
    <div className="seller-subview">
      <MetricCards metrics={analyticsMetrics} />
      <div style={{ marginTop: '20px', width: '100%' }}>
        <RevenueChart seller orders={orders} />
      </div>
    </div>
  )
}

function SellerStorefrontView({ notify, session }) {
  const getInitial = (key, fallback) => {
    try {
      const saved = localStorage.getItem(`northstar_storefront_${session?.userId}`) || localStorage.getItem('northstar_storefront_profile')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && parsed[key]) return parsed[key]
      }
    } catch {}
    return fallback
  }

  const [storeName, setStoreName] = useState(() => getInitial('storeName', session?.name ? `${session.name}'s Workshop` : "Aman Verma's Workshop"))
  const [bio, setBio] = useState(() => getInitial('bio', 'Curated objects designed with quiet character, honest materials, and functional simplicity.'))
  const [email, setEmail] = useState(() => getInitial('email', session?.email || 'varmaaman1078@gmail.com'))
  const [policy, setPolicy] = useState(() => getInitial('policy', '30-day returns on unused objects. Free return pickup available across India.'))
  const [saved, setSaved] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    const profile = {
      storeName: storeName.trim(),
      bio: bio.trim(),
      email: email.trim(),
      policy: policy.trim(),
      sellerId: session?.userId,
      sellerName: session?.name || storeName.trim(),
    }
    localStorage.setItem('northstar_storefront_profile', JSON.stringify(profile))
    if (session?.userId) {
      localStorage.setItem(`northstar_storefront_${session.userId}`, JSON.stringify(profile))
    }
    setSaved(true)
    notify('Storefront settings updated successfully')
    setTimeout(() => setSaved(false), 2400)
  }

  return (
    <div className="seller-subview storefront-grid">
      <article className="dashboard-card">
        <div className="card-heading" style={{ marginBottom: '18px' }}>
          <div>
            <span>Store Profile & Settings</span>
            <small>How buyers see your brand on Northstar</small>
          </div>
        </div>
        <form onSubmit={handleSave} className="storefront-settings-form">
          <label>
            <span>Store Brand Name</span>
            <input required value={storeName} onChange={(e) => setStoreName(e.target.value)} />
          </label>
          <label>
            <span>Brand Bio / Story</span>
            <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
          </label>
          <label>
            <span>Public Support Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            <span>Shipping & Returns Policy</span>
            <textarea rows={2} value={policy} onChange={(e) => setPolicy(e.target.value)} />
          </label>
          <button className="primary-button" style={{ marginTop: '6px', width: 'fit-content' }}>
            {saved ? '✓ Profile Saved' : 'Save Storefront Profile'}
          </button>
        </form>
      </article>

      <article className="dashboard-card" style={{ background: '#fafaf8' }}>
        <div className="card-heading" style={{ marginBottom: '18px' }}>
          <div>
            <span>Live Store Preview</span>
            <small>Buyer view on storefront</small>
          </div>
          <span className="live-pill"><i /> Verified Merchant</span>
        </div>
        <div style={{ border: '1px solid #e1e3de', borderRadius: '12px', padding: '24px', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div className="large-avatar" style={{ width: '44px', height: '44px', fontSize: '14px' }}>
              {storeName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px' }}>{storeName}</h3>
              <small style={{ color: 'var(--muted)', fontSize: '11px' }}>{email}</small>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: '#555', lineHeight: 1.6, margin: '12px 0' }}>{bio}</p>
          <div style={{ borderTop: '1px solid #eff0ed', paddingTop: '12px', marginTop: '14px', fontSize: '11px', color: 'var(--muted)' }}>
            <strong>Policy:</strong> {policy}
          </div>
        </div>
      </article>
    </div>
  )
}

function SellerDashboard({
  products = [],
  orders = [],
  notify,
  onLogout,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onRestockProduct,
  onUpdateOrder,
  session,
}) {
  const [currentTab, setCurrentTab] = useState('Overview')

  const revenue = orders.reduce((total, order) => total + Number(order.sellerTotal ?? order.totalAmount ?? 0), 0) / 100
  const pendingOrdersCount = orders.filter((order) => order.status === 'CONFIRMED').length

  const liveMetrics = [
    { label: 'Net sales', value: `₹${revenue.toLocaleString()}`, change: '+18.2%', icon: 'trend', tone: 'green' },
    { label: 'Orders', value: String(orders.length), change: `${pendingOrdersCount} to fulfill`, icon: 'bag', tone: 'blue' },
    { label: 'Active Catalog', value: String(products.length), change: 'Listed pieces', icon: 'box', tone: 'orange' },
    { label: 'Store rating', value: '4.9', change: '186 reviews', icon: 'star', tone: 'purple' },
  ]

  const lowStockProducts = products.filter((p) => (p.stock ?? p.stockQuantity ?? 0) < 10)

  return (
    <main className="portal-layout">
      <PortalSidebar
        portal="seller"
        activeTab={currentTab}
        onSelectTab={setCurrentTab}
        onLogout={onLogout}
        orderBadgeCount={pendingOrdersCount}
      />
      <section className="portal-main">
        <header className="portal-header">
          <div>
            <span className="portal-kicker">Seller workspace</span>
            <h1>{currentTab === 'Overview' ? 'Your store, at a glance.' : currentTab}</h1>
            <p>
              {currentTab === 'Overview' && 'Manage products and keep every order moving.'}
              {currentTab === 'Orders' && 'Track fulfillment, customer shipments, and order statuses.'}
              {currentTab === 'Products' && 'Manage your active listings, pricing, and stock inventory.'}
              {currentTab === 'Analytics' && 'Performance charts, revenue insights, and fulfillment metrics.'}
              {currentTab === 'Storefront' && 'Customize your store profile, branding, and merchant policies.'}
            </p>
          </div>
          <div className="portal-actions">
            <button className="primary-button" onClick={onAddProduct}>
              <Icon name="plus" size={16} /> Add product
            </button>
          </div>
        </header>

        {currentTab === 'Overview' && (
          <>
            <MetricCards metrics={liveMetrics} />
            <div className="dashboard-split seller-split">
              <RevenueChart seller orders={orders} />
              <article className="dashboard-card stock-card">
                <div className="card-heading">
                  <div>
                    <span>Inventory attention</span>
                    <small>Items running low</small>
                  </div>
                  <span className="alert-count">{lowStockProducts.length}</span>
                </div>
                {lowStockProducts.length === 0 ? (
                  <p className="empty-dashboard-state">All inventory is well-stocked.</p>
                ) : (
                  lowStockProducts.slice(0, 3).map((product) => (
                    <div className="stock-row" key={product.id}>
                      <span className="mini-product" style={{ '--product-bg': product.color, '--product-accent': product.accent }}>
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="mini-product-img"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              const fb = e.currentTarget.parentElement?.querySelector('.mini-fallback')
                              if (fb) fb.style.display = 'grid'
                            }}
                          />
                        ) : null}
                        <span className="mini-fallback" style={product.imageUrl ? { display: 'none' } : {}}>
                          <ProductVisual type={product.visual} />
                        </span>
                      </span>
                      <div>
                        <strong>{product.name}</strong>
                        <small>{product.stock ?? product.stockQuantity ?? 0} units remaining</small>
                      </div>
                      <button onClick={() => onRestockProduct && onRestockProduct(product)}>Restock</button>
                    </div>
                  ))
                )}
              </article>
            </div>
            <div className="dashboard-lower seller-lower">
              <article className="dashboard-card products-card">
                <div className="card-heading">
                  <div>
                    <span>Your products</span>
                    <small>{products.length} active listings</small>
                  </div>
                  <button className="text-button" onClick={() => setCurrentTab('Products')}>View all</button>
                </div>
                {products.length === 0 ? (
                  <p className="empty-dashboard-state">No products listed yet.</p>
                ) : (
                  products.slice(0, 4).map((product) => (
                    <div className="seller-product-row" key={product.id}>
                      <span className="mini-product" style={{ '--product-bg': product.color, '--product-accent': product.accent }}>
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="mini-product-img"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              const fb = e.currentTarget.parentElement?.querySelector('.mini-fallback')
                              if (fb) fb.style.display = 'grid'
                            }}
                          />
                        ) : null}
                        <span className="mini-fallback" style={product.imageUrl ? { display: 'none' } : {}}>
                          <ProductVisual type={product.visual} />
                        </span>
                      </span>
                      <div>
                        <strong>{product.name}</strong>
                        <small>{product.category} · SKU #{product.id}</small>
                      </div>
                      <span className="listing-status"><i /> Active</span>
                      <b>₹{Number(product.price).toLocaleString()}</b>
                      <button className="icon-button" onClick={() => onEditProduct && onEditProduct(product)}>•••</button>
                    </div>
                  ))
                )}
              </article>
              <article className="dashboard-card seller-orders">
                <div className="card-heading">
                  <div>
                    <span>Orders to fulfil</span>
                    <small>{pendingOrdersCount} need action</small>
                  </div>
                  <button className="text-button" onClick={() => setCurrentTab('Orders')}>View all</button>
                </div>
                {orders.length === 0 ? (
                  <p className="empty-dashboard-state">No seller orders yet.</p>
                ) : (
                  orders.slice(0, 3).map((order) => {
                    const orderId = order.orderId || order.id
                    const nextStatus = order.status === 'CONFIRMED' ? 'SHIPPED' : order.status === 'SHIPPED' ? 'DELIVERED' : null
                    return (
                      <div className="fulfillment-row" key={orderId}>
                        <div>
                          <strong>#{orderId}</strong>
                          <small>{order.items?.length || 0} item(s)</small>
                        </div>
                        <b>₹{((order.sellerTotal ?? order.totalAmount ?? 0) / 100).toFixed(2)}</b>
                        <button
                          className={!nextStatus ? 'shipped' : ''}
                          disabled={!nextStatus}
                          onClick={() => nextStatus && onUpdateOrder(orderId, nextStatus)}
                        >
                          {nextStatus ? `Mark ${nextStatus.toLowerCase()}` : order.status}
                        </button>
                      </div>
                    )
                  })
                )}
              </article>
            </div>
          </>
        )}

        {currentTab === 'Orders' && (
          <SellerOrdersView orders={orders} onUpdateOrder={onUpdateOrder} notify={notify} />
        )}

        {currentTab === 'Products' && (
          <SellerProductsView
            products={products}
            onAddProduct={onAddProduct}
            onEditProduct={onEditProduct}
            onDeleteProduct={onDeleteProduct}
            onRestockProduct={onRestockProduct}
          />
        )}

        {currentTab === 'Analytics' && (
          <SellerAnalyticsView products={products} orders={orders} />
        )}

        {currentTab === 'Storefront' && (
          <SellerStorefrontView notify={notify} session={session} />
        )}
      </section>
    </main>
  )
}

export { AdminDashboard, SellerDashboard }
