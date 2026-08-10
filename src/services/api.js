import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
  validateToken: () => api.get('/auth/validate'),
  placeOrder: (data) => api.post('/customer/orders', data),
};

export const adminAPI = {
  login: (data) => api.post('/admin/auth/login', data),
};

export const customerOrdersAPI = {
  getAll: (params) => api.get('/customer/orders', { params }),
  getById: (orderId) => api.get(`/customer/orders/${orderId}`),
  getReceipt: (orderId) => api.get(`/customer/orders/${orderId}/receipt`),
};

export const catalogAPI = {
  getCategories: () => api.get('/categories'),
  getProducts: () => api.get('/products'),
  getProductById: (id) => api.get(`/products/${id}`),
  searchProducts: (query) => api.get('/products/search', { params: { q: query } }),
  getActiveCoupons: () => api.get('/coupons/active'),
  validateCoupon: (code, subtotal, productIds) => api.get('/coupons/validate', { params: { code, subtotal, productIds } }),
};

export const customerReviewsAPI = {
  getProductReviews: (productId) => api.get(`/customer/reviews/product/${productId}`),
  getMyReviews: () => api.get('/customer/reviews/my'),
  submit: (data) => api.post('/customer/reviews', data),
  delete: (reviewId) => api.delete(`/customer/reviews/${reviewId}`),
};

export default api;
