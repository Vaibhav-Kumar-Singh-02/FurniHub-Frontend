const API_BASE = 'http://localhost:8080/api'

export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed with status ${response.status}`)
    error.status = response.status
    error.body = data
    throw error
  }
  return data
}

export function getCategories() {
  return apiFetch('/categories')
}

export function getProducts({ categoryId, page = 0, size = 12 } = {}) {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (categoryId) params.set('categoryId', String(categoryId))
  return apiFetch(`/products?${params.toString()}`)
}

export function getProduct(id) {
  return apiFetch(`/products/${id}`)
}

export function getCart(token) {
  return apiFetch('/cart', { token })
}

export function addCartItem(productId, quantity, token) {
  return apiFetch('/cart/items', { method: 'POST', body: { productId, quantity }, token })
}

export function updateCartItem(itemId, quantity, token) {
  return apiFetch(`/cart/items/${itemId}`, { method: 'PUT', body: { quantity }, token })
}

export function removeCartItem(itemId, token) {
  return apiFetch(`/cart/items/${itemId}`, { method: 'DELETE', token })
}

export function createOrder(shipping, token) {
  return apiFetch('/orders', { method: 'POST', body: shipping, token })
}

export function getOrders(token) {
  return apiFetch('/orders', { token })
}

export function getOrder(id, token) {
  return apiFetch(`/orders/${id}`, { token })
}
