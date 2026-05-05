import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('cc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cc_token');
      localStorage.removeItem('cc_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/user/register', data),
  login: (data) => api.post('/user/login', data),
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
  add: (formData) => api.post('/food/add', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/food/update/${id}`, data),
  delete: (id) => api.delete(`/food/delete/${id}`),
};

// Orders
export const orderAPI = {
  place: (data) => api.post('/orders/place', data),
  getByCustomer: (customerId) => api.get(`/orders/customer/${customerId}`),
  updateStatus: (orderId, status) => api.patch(`/orders/${orderId}/status?status=${status}`),
};

export default api;
