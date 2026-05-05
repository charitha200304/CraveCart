package com.cravecart.backend.service;

import com.cravecart.backend.dto.OrderRequestDTO;
import com.cravecart.backend.entity.Order;
import java.util.List;

public interface OrderService {
    Order placeOrder(OrderRequestDTO orderRequest);
    List<Order> getOrdersByCustomerId(Long customerId);
    List<Order> getOrdersByRestaurantId(Long restaurantId);
    Order updateOrderStatus(Long orderId, String status);
    Order getOrderById(Long orderId);
}