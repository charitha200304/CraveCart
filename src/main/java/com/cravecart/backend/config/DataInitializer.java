package com.cravecart.backend.config;

import com.cravecart.backend.repository.UserRepository;
import com.cravecart.backend.repository.RestaurantRepository;
import com.cravecart.backend.repository.FoodItemRepository;
import com.cravecart.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final FoodItemRepository foodItemRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Temporarily disabled seeding to allow the backend to start without errors
        System.out.println(">> Data Seeding is temporarily disabled for stability.");
    }
}
