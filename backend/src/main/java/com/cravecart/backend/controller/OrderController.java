package com.cravecart.backend.controller;

import com.cravecart.backend.dto.OrderRequestDTO;
import com.cravecart.backend.entity.Order;
import com.cravecart.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "https://cravecart-frontend.vercel.app"})
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/place")
    public ResponseEntity<?> placeOrder(@Valid @RequestBody OrderRequestDTO orderRequest) {
        try {
            System.out.println("Placing order for customer: " + orderRequest.getCustomerId());
            Order savedOrder = orderService.placeOrder(orderRequest);
            return ResponseEntity.ok(savedOrder);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Order>> getCustomerOrders(@PathVariable Long customerId) {
        return ResponseEntity.ok(orderService.getOrdersByCustomerId(customerId));
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<Order> updateStatus(
            @PathVariable Long orderId, 
            @RequestParam String status,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status, reason));
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<Order>> getRestaurantOrders(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(orderService.getOrdersByRestaurantId(restaurantId));
    }

    // Admin endpoints
    @GetMapping("/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok("Order deleted successfully");
    }
}