package com.cravecart.backend.service.impl;

import com.cravecart.backend.dto.OrderItemDTO;
import com.cravecart.backend.dto.OrderRequestDTO;
import com.cravecart.backend.entity.*;
import com.cravecart.backend.repository.*;
import com.cravecart.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final FoodItemRepository foodItemRepository;

    @Override
    @Transactional
    public Order placeOrder(OrderRequestDTO dto) {
        User customer = userRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Restaurant restaurant = restaurantRepository.findById(dto.getRestaurantId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        Order order = new Order();
        order.setCustomer(customer);
        order.setRestaurant(restaurant);
        order.setOrderDate(new Date());
        order.setStatus("PENDING");
        order.setDeliveryAddress(dto.getDeliveryAddress());
        order.setContactNumber(dto.getContactNumber());
        order.setPaymentMethod(dto.getPaymentMethod());

        double totalAmount = 0.0;
        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderItemDTO itemDto : dto.getItems()) {
            FoodItem foodItem = foodItemRepository.findById(itemDto.getFoodItemId())
                    .orElseThrow(() -> new RuntimeException("Food item not found"));

            // Stock Validation
            Integer stock = foodItem.getStockQuantity() != null ? foodItem.getStockQuantity() : 0;
            if (stock < itemDto.getQuantity()) {
                throw new RuntimeException("Insufficient stock for: " + foodItem.getName());
            }

            // Update Stock
            foodItem.setStockQuantity(stock - itemDto.getQuantity());
            foodItemRepository.save(foodItem);

            // Create OrderItem Entity
            OrderItem orderItem = new OrderItem();
            orderItem.setFoodItem(foodItem);
            orderItem.setQuantity(itemDto.getQuantity());
            orderItem.setPrice(foodItem.getPrice() * itemDto.getQuantity());
            orderItem.setOrder(order);

            totalAmount += orderItem.getPrice();
            orderItems.add(orderItem);
        }

        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);

        return orderRepository.save(order);
    }

    @Override
    public List<Order> getOrdersByCustomerId(Long customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    @Override
    public List<Order> getOrdersByRestaurantId(Long restaurantId) {
        return orderRepository.findByRestaurantId(restaurantId);
    }

    @Override
    public Order updateOrderStatus(Long orderId, String status, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status.toUpperCase());
        if (reason != null) {
            order.setCancellationReason(reason);
        }
        return orderRepository.save(order);
    }
    @Override
    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }
}