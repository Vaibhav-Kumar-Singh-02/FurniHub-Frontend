import axios from 'axios';

const getBaseUrl = () => {
  let url = process.env.REACT_APP_API_URL || '/api';
  url = url.trim().replace(/\/+$/, '');
  if (url.startsWith('http') && !url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

const API_URL = getBaseUrl();

const adminAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

adminAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminAPI.interceptors.response.use(
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

export const dashboardAPI = {
  getStats: () => adminAPI.get('/admin/dashboard/stats'),
  getRevenue: (params) => adminAPI.get('/admin/analytics/revenue', { params }),
  getOrderStats: (params) => adminAPI.get('/admin/analytics/orders', { params }),
  getBestSellingProducts: (params) => adminAPI.get('/admin/analytics/best-selling-products', { params }),
  getBestSellingCategories: (params) => adminAPI.get('/admin/analytics/best-selling-categories', { params }),
  getTopCustomers: (params) => adminAPI.get('/admin/analytics/top-customers', { params }),
};

export const productsAPI = {
  getAll: (params) => adminAPI.get('/admin/products', { params }),
  getOne: (id) => adminAPI.get(`/admin/products/${id}`),
  create: (data) => adminAPI.post('/admin/products', data),
  update: (id, data) => adminAPI.put(`/admin/products/${id}`, data),
  delete: (id) => adminAPI.delete(`/admin/products/${id}`),
};

export const usersAPI = {
  getAll: (params) => adminAPI.get('/admin/users', { params }),
  getOne: (id) => adminAPI.get(`/admin/users/${id}`),
  update: (id, data) => adminAPI.put(`/admin/users/${id}`, data),
  block: (id) => adminAPI.post(`/admin/users/${id}/block`),
  unblock: (id) => adminAPI.post(`/admin/users/${id}/unblock`),
  delete: (id) => adminAPI.delete(`/admin/users/${id}`),
  restore: (id) => adminAPI.post(`/admin/users/${id}/restore`),
};

export const ordersAPI = {
  getAll: (params) => adminAPI.get('/admin/orders', { params }),
  getOne: (id) => adminAPI.get(`/admin/orders/${id}`),
  updateStatus: (id, data) => adminAPI.put(`/admin/orders/${id}/status`, data),
  cancel: (id) => adminAPI.post(`/admin/orders/${id}/cancel`),
};

export const categoriesAPI = {
  getAll: () => adminAPI.get('/admin/categories'),
  create: (data) => adminAPI.post('/admin/categories', data),
  update: (id, data) => adminAPI.put(`/admin/categories/${id}`, data),
  delete: (id) => adminAPI.delete(`/admin/categories/${id}`),
};

export const inventoryAPI = {
  getLowStock: () => adminAPI.get('/admin/inventory/low-stock'),
  getOutOfStock: () => adminAPI.get('/admin/inventory/out-of-stock'),
  getAll: (params) => adminAPI.get('/admin/inventory', { params }),
  updateStock: (id, data) => adminAPI.put(`/admin/inventory/${id}/stock`, data),
};

export const couponsAPI = {
  getAll: (params) => adminAPI.get('/admin/coupons', { params }),
  create: (data) => adminAPI.post('/admin/coupons', data),
  update: (id, data) => adminAPI.put(`/admin/coupons/${id}`, data),
  disable: (id) => adminAPI.post(`/admin/coupons/${id}/disable`),
  enable: (id) => adminAPI.post(`/admin/coupons/${id}/enable`),
  delete: (id) => adminAPI.delete(`/admin/coupons/${id}`),
};

export const reviewsAPI = {
  getAll: (params) => adminAPI.get('/admin/reviews', { params }),
  getOne: (id) => adminAPI.get(`/admin/reviews/${id}`),
  approve: (id) => adminAPI.post(`/admin/reviews/${id}/approve`),
  reject: (id) => adminAPI.post(`/admin/reviews/${id}/reject`),
  delete: (id) => adminAPI.delete(`/admin/reviews/${id}`),
  reply: (id, data) => adminAPI.post(`/admin/reviews/${id}/reply`, data),
};

export const settingsAPI = {
  getProfile: () => adminAPI.get('/admin/settings/profile'),
  updateProfile: (data) => adminAPI.put('/admin/settings/profile', data),
  changePassword: (data) => adminAPI.post('/admin/settings/password', data),
  getAppSettings: () => adminAPI.get('/admin/settings/app'),
  updateAppSettings: (data) => adminAPI.put('/admin/settings/app', data),
};

export const notificationsAPI = {
  getAll: (params) => adminAPI.get('/admin/notifications', { params }),
  getUnread: () => adminAPI.get('/admin/notifications/unread'),
  markAsRead: (id) => adminAPI.post(`/admin/notifications/${id}/read`),
  markAllAsRead: () => adminAPI.post('/admin/notifications/read-all'),
  delete: (id) => adminAPI.delete(`/admin/notifications/${id}`),
  generate: (data) => adminAPI.post('/admin/notifications/generate', data),
};

export default adminAPI;
