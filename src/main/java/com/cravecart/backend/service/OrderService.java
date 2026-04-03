package com.cravecart.backend.service;

import com.cravecart.backend.entity.*;
import com.cravecart.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Transactional
    public Order placeOrder(Order orderRequest) {

        if (orderRequest.getCustomer() == null || orderRequest.getCustomer().getId() == null) {
            throw new RuntimeException("Customer ID is required");
        }

        if (orderRequest.getRestaurant() == null || orderRequest.getRestaurant().getId() == null) {
            throw new RuntimeException("Restaurant ID is required");
        }

        User customer = userRepository.findById(orderRequest.getCustomer().getId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Restaurant restaurant = restaurantRepository.findById(orderRequest.getRestaurant().getId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        orderRequest.setCustomer(customer);
        orderRequest.setRestaurant(restaurant);
        orderRequest.setOrderDate(new Date());
        orderRequest.setStatus("PENDING");

        if (orderRequest.getItems() == null || orderRequest.getItems().isEmpty()) {
            throw new RuntimeException("Order items cannot be empty");
        }

        double total = 0.0;

        for (OrderItem item : orderRequest.getItems()) {

            if (item.getFoodItem() == null || item.getFoodItem().getId() == null) {
                throw new RuntimeException("FoodItem ID is required");
            }

            FoodItem foodItem = foodItemRepository.findById(item.getFoodItem().getId())
                    .orElseThrow(() -> new RuntimeException("FoodItem not found"));

            item.setFoodItem(foodItem);
            item.setOrder(orderRequest);

            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new RuntimeException("Invalid quantity");
            }

            if (item.getPrice() == null) {
                throw new RuntimeException("Price cannot be null");
            }

            total += item.getPrice() * item.getQuantity();
        }

        orderRequest.setTotalAmount(total);

        return orderRepository.save(orderRequest);
    }
}