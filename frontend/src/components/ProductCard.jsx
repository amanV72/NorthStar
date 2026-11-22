import { Icon } from './Icons'
import { ProductVisual } from './ProductVisual'

export function ProductCard({ product, favorite, onFavorite, onSelect, onAdd }) {
  if (!product) return null

  const hasPhoto = Boolean(product.imageUrl)
  const priceDisplay = typeof product.price === 'number'
    ? product.price.toLocaleString()
    : (Number(product.price) || 0).toLocaleString()
  const oldPriceDisplay = product.oldPrice != null
    ? (Number(product.oldPrice) || 0).toLocaleString()
    : null

  return (
    <article className="product-card">
      <button
        className="product-image"
        style={{ '--product-bg': product.color || '#d7e7df', '--product-accent': product.accent || '#26635a' }}
        onClick={() => onSelect && onSelect(product)}
        aria-label={`View ${product.name || 'product'}`}
      >
        {product.badge && <span className="product-badge">{product.badge}</span>}
        {hasPhoto ? (
          <img
            src={product.imageUrl}
            alt={product.name || 'Product'}
            className="product-card-photo"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              const fallback = e.currentTarget.parentElement?.querySelector('.product-visual')
              if (fallback) fallback.style.display = 'grid'
            }}
          />
        ) : null}
        <span className="product-visual" style={hasPhoto ? { display: 'none' } : {}}>
          <ProductVisual type={product.visual || 'lamp'} />
        </span>
      </button>
      <button
        className={`favorite-button ${favorite ? 'selected' : ''}`}
        onClick={() => onFavorite && onFavorite(product.id)}
        aria-label={`${favorite ? 'Remove' : 'Add'} ${product.name || 'piece'} ${favorite ? 'from' : 'to'} favorites`}
      >
        <Icon name="heart" size={18} />
      </button>
      <div className="product-details">
        <button className="product-name" onClick={() => onSelect && onSelect(product)}>
          {product.name || 'Untitled Product'}
        </button>
        <div className="rating">
          <Icon name="star" size={13} />
          <span>{product.rating ?? 4.8}</span>
          <small>({product.reviews ?? 0})</small>
        </div>
        <div className="product-price-row">
          <p>
            <strong>₹{priceDisplay}</strong>
            {oldPriceDisplay && <del>₹{oldPriceDisplay}</del>}
          </p>
          <button
            className="quick-add"
            onClick={() => onAdd && onAdd(product)}
            aria-label={`Add ${product.name || 'piece'} to cart`}
          >
            <Icon name="plus" size={17} />
          </button>
        </div>
      </div>
    </article>
  )
}
