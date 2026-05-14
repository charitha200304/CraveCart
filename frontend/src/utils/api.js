import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('cc_token') || sessionStorage.getItem('cc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cc_token');
      localStorage.removeItem('cc_user');
      sessionStorage.removeItem('cc_token');
      sessionStorage.removeItem('cc_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/user/register', data),
  login: (data) => api.post('/user/login', data),
  forgotPassword: (data) => api.post('/user/forgot-password', data),
  resetPassword: (data) => api.post('/user/reset-password', data),
};

// Restaurants
export const restaurantAPI = {
  getAll: () => api.get('/restaurants/all'),
  getById: (id) => api.get(`/restaurants/${id}`),
  add: (formData) => api.post('/restaurants/add', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/restaurants/${id}`, data),
  delete: (id) => api.delete(`/restaurants/${id}`),
};

// Food
export const foodAPI = {
  getAll: () => api.get('/food/all'),
  getById: (id) => api.get(`/food/${id}`),
  add: (data) => api.post('/food/add', data),
  update: (id, data) => api.put(`/food/update/${id}`, data),
  delete: (id) => api.delete(`/food/delete/${id}`),
};

// Orders
export const orderAPI = {
  place: (data) => api.post('/orders/place', data),
  getByCustomer: (customerId) => api.get(`/orders/customer/${customerId}`),
  getRestaurantOrders: (restaurantId) => api.get(`/orders/restaurant/${restaurantId}`),
  updateStatus: (orderId, status, reason = '') => api.patch(`/orders/${orderId}/status?status=${status}&reason=${reason}`),
};

// Reviews
export const reviewAPI = {
  add: (data) => api.post('/reviews', data),
  getRestaurantReviews: (id) => api.get(`/reviews/restaurant/${id}`),
  getFoodReviews: (id) => api.get(`/reviews/food/${id}`),
};

// User Profile
export const userAPI = {
  get: (id) => api.get(`/user/${id}`),
  update: (id, data) => api.put(`/user/${id}`, data),
};

export default api;
