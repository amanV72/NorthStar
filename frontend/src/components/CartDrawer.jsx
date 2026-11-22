import { Icon } from './Icons'
import { ProductVisual } from './ProductVisual'

export function CartDrawer({ open, items, onClose, onQuantity, onCheckout }) {
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <div className={`drawer-layer ${open ? 'open' : ''}`} aria-hidden={!open}>
      <button className="drawer-scrim" aria-label="Close cart" onClick={onClose} />
      <aside className="cart-drawer" aria-label="Shopping cart">
        <div className="drawer-header">
          <div><span className="eyebrow"><span /> Your selection</span><h2>Shopping cart</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Close cart"><Icon name="close" /></button>
        </div>

        {items.length === 0 ? (
          <div className="empty-cart">
            <span><Icon name="bag" size={34} /></span>
            <h3>Your cart is taking a breather.</h3>
            <p>Add something thoughtful and it will appear here.</p>
            <button className="secondary-button" onClick={onClose}>Continue shopping</button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <article className="cart-item" key={item.id}>
                  <div className="cart-thumb" style={{ '--product-bg': item.color, '--product-accent': item.accent }}>
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="cart-thumb-img"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const fb = e.currentTarget.parentElement?.querySelector('.cart-thumb-fallback')
                          if (fb) fb.style.display = 'grid'
                        }}
                      />
                    ) : null}
                    <span className="cart-thumb-fallback" style={item.imageUrl ? { display: 'none' } : {}}>
                      <ProductVisual type={item.visual} />
                    </span>
                  </div>
                  <div className="cart-item-copy">
                    <div><h3>{item.name}</h3><p>{item.category}</p></div>
                    <div className="cart-item-bottom">
                      <div className="quantity-control">
                        <button onClick={() => onQuantity(item.id, -1)} aria-label={`Remove one ${item.name}`}><Icon name="minus" size={13} /></button>
                        <span>{item.quantity}</span>
                        <button onClick={() => onQuantity(item.id, 1)} aria-label={`Add one ${item.name}`}><Icon name="plus" size={13} /></button>
                      </div>
                      <strong>₹{(item.price * item.quantity).toLocaleString()}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="cart-summary">
              <div className="shipping-progress"><div><span>Free shipping unlocked</span><Icon name="check" size={15} /></div><span><i /></span></div>
              <div className="summary-line"><span>Subtotal</span><strong>₹{subtotal.toLocaleString()}</strong></div>
              <div className="summary-line muted"><span>Shipping</span><span>Complimentary</span></div>
              <button className="primary-button checkout-button" onClick={onCheckout}>Continue to checkout <Icon name="arrow" /></button>
              <small className="secure-note"><Icon name="shield" size={14} /> Bank-grade encryption · Powered by Razorpay</small>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
