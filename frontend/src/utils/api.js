import axios from 'axios';

const BASE_URL = 'https://cravecart-werf.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
});

export const authAPI = {
  login: (data) => api.post('/user/login', data),
  register: (data) => api.post('/user/register', data),
  verify: (code, email) => api.get(`/user/verify?code=${code}&email=${email}`),
};

export const restaurantAPI = {
  getAll: () => api.get('/restaurants/all'),
  getById: (id) => api.get(`/restaurants/${id}`),
};

export const foodItemAPI = {
  getByRestaurant: (id) => api.get(`/food-items/restaurant/${id}`),
};

export const orderAPI = {
  create: (data) => api.post('/orders/create', data),
  getUserOrders: (id) => api.get(`/orders/user/${id}`),
};

export default api;
