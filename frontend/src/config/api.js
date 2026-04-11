// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/user/login`,
  REGISTER: `${API_BASE_URL}/user/register`,
  
  // Restaurants
  RESTAURANTS: `${API_BASE_URL}/restaurants/all`,
  RESTAURANT_BY_ID: (id) => `${API_BASE_URL}/restaurants/${id}`,
  ADD_RESTAURANT: `${API_BASE_URL}/restaurants/add`,
  UPDATE_RESTAURANT: (id) => `${API_BASE_URL}/restaurants/${id}`,
  DELETE_RESTAURANT: (id) => `${API_BASE_URL}/restaurants/${id}`,
  
  // Food Items
  FOOD_ITEMS: `${API_BASE_URL}/food/all`,
  FOOD_BY_ID: (id) => `${API_BASE_URL}/food/${id}`,
  ADD_FOOD: `${API_BASE_URL}/food/add`,
  UPDATE_FOOD: (id) => `${API_BASE_URL}/food/update/${id}`,
  DELETE_FOOD: (id) => `${API_BASE_URL}/food/delete/${id}`,
  
  // Orders
  PLACE_ORDER: `${API_BASE_URL}/orders/place`,
  CUSTOMER_ORDERS: (customerId) => `${API_BASE_URL}/orders/customer/${customerId}`,
  UPDATE_ORDER_STATUS: (orderId) => `${API_BASE_URL}/orders/${orderId}/status`,
};

export default API_BASE_URL;
