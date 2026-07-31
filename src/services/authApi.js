const API_BASE = 'http://localhost:8080/api'

async function request(path, { method = 'POST', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
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

export function registerUser(payload) {
  return request('/auth/register', { body: payload })
}

export function loginUser(payload) {
  return request('/auth/login', { body: payload })
}

export function forgotPassword(payload) {
  return request('/auth/forgot-password', { body: payload })
}

export function verifyOtp(payload) {
  return request('/auth/verify-otp', { body: payload })
}

export function resetPassword(payload) {
  return request('/auth/reset-password', { body: payload })
}

export function changePassword(payload, token) {
  return request('/auth/change-password', { body: payload, token })
}

export function logoutUser(token) {
  return request('/auth/logout', { token })
}

export function validateToken(token) {
  return request('/auth/validate', { method: 'GET', token })
}
