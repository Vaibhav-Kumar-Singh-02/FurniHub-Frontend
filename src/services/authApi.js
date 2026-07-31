const API_BASE = 'http://localhost:8080/api'

async function request(path, { method = 'POST', body } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
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
