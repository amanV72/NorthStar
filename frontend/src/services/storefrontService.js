import { apiRequest } from './apiClient'

const visuals = ['lamp', 'headphones', 'bag', 'speaker', 'carafe', 'notebook', 'mug', 'tray']
const colors = [
  ['#d7e7df', '#26635a'], ['#e7dfd2', '#b05d3b'], ['#dce2ea', '#425c7a'],
  ['#e4dbe6', '#71527a'], ['#eadfce', '#9a6b3e'], ['#d8e5da', '#466c4b'],
]

export function normalizeProduct(product, index = 0) {
  if (!product) return null
  const [color, accent] = colors[index % colors.length]
  const rawPrice = product.price != null ? Number(product.price) : 0
  const normalizedPrice = rawPrice > 1000 ? rawPrice / 100 : rawPrice
  return {
    ...product,
    id: String(product.id ?? index),
    name: product.name || 'Handcrafted Piece',
    category: product.category || 'Workspace',
    price: normalizedPrice > 0 ? normalizedPrice : 99,
    rating: product.rating ?? 4.8,
    reviews: product.reviews ?? 0,
    color: product.color || color,
    accent: product.accent || accent,
    visual: product.visual || visuals[index % visuals.length],
    stock: product.stockQuantity ?? product.stock ?? 10,
  }
}

export const storefrontService = {
  listProducts: async () => {
    const raw = await apiRequest('/api/products')
    if (!Array.isArray(raw)) return []
    const normalized = await Promise.all(
      raw.map(async (product, index) => {
        try {
          const inv = await apiRequest(`/api/inventory/${product.id}`)
          const availableStock = inv?.availableQuantity ?? (inv?.totalQuantity != null ? inv.totalQuantity - (inv.reservedQuantity || 0) : null) ?? product.stockQuantity ?? 0
          return normalizeProduct({ ...product, stockQuantity: availableStock }, index)
        } catch {
          return normalizeProduct(product, index)
        }
      })
    )
    return normalized.filter(Boolean)
  },
  getCart: () => apiRequest('/api/cart'),
  addToCart: (productId, quantity = 1) => apiRequest('/api/cart', {
    method: 'POST', body: JSON.stringify({ productId: String(productId), quantity }),
  }),
  updateCartQuantity: (productId, quantity) => apiRequest(`/api/cart/items/${productId}`, {
    method: 'PUT', body: JSON.stringify({ quantity }),
  }),
  removeCartItem: (productId) => apiRequest(`/api/cart/items/${productId}`, { method: 'DELETE' }),
  clearCart: () => apiRequest('/api/cart', { method: 'DELETE' }),
  createOrder: () => apiRequest('/api/orders', { method: 'POST' }),
  listOrders: () => apiRequest('/api/orders'),
  getOrderPayment: (orderId) => apiRequest(`/api/orders/${orderId}`),
  getPaymentDetails: (paymentId) => apiRequest(`/api/payments/${paymentId}`),
  verifyPayment: (details) => apiRequest('/api/payments/verify-payment', {
    method: 'POST', body: JSON.stringify(details),
  }),
  listSellerProducts: async () => {
    const raw = await apiRequest('/api/products/seller')
    if (!Array.isArray(raw)) return []
    const normalized = await Promise.all(
      raw.map(async (product, index) => {
        try {
          const inv = await apiRequest(`/api/inventory/${product.id}`)
          const availableStock = inv?.availableQuantity ?? (inv?.totalQuantity != null ? inv.totalQuantity - (inv.reservedQuantity || 0) : null) ?? product.stockQuantity ?? 0
          return normalizeProduct({ ...product, stockQuantity: availableStock }, index)
        } catch {
          return normalizeProduct(product, index)
        }
      })
    )
    return normalized.filter(Boolean)
  },
  listSellerOrders: () => apiRequest('/api/orders/seller'),
  createSellerProduct: (product) => apiRequest('/api/products/seller', {
    method: 'POST', body: JSON.stringify(product),
  }),
  updateSellerProduct: (id, product) => apiRequest(`/api/products/seller/${id}`, {
    method: 'PUT', body: JSON.stringify(product),
  }),
  deleteSellerProduct: (id) => apiRequest(`/api/products/seller/${id}`, {
    method: 'DELETE',
  }),
  restockProduct: (productId, quantity) => apiRequest(`/api/inventory/${productId}/restock`, {
    method: 'POST', body: JSON.stringify({ quantity }),
  }),
  updateSellerOrderStatus: (orderId, status) => apiRequest(`/api/orders/seller/${orderId}/status`, {
    method: 'PATCH', body: JSON.stringify({ status }),
  }),
  uploadProductImage: (productId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiRequest(`/api/products/seller/${productId}/image`, {
      method: 'POST',
      body: formData,
    })
  },
  uploadStandaloneImage: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiRequest('/api/products/seller/upload-image', {
      method: 'POST',
      body: formData,
    })
  },
  getUserProfile: (userId) => apiRequest(`/api/users/${userId}`),
  updateUserProfile: (userId, profileData) => apiRequest(`/api/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }),
}
