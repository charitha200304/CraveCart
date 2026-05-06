package com.cravecart.backend.config;

import com.cravecart.backend.entity.User;
import com.cravecart.backend.repository.UserRepository;
import com.cravecart.backend.repository.RestaurantRepository;
import com.cravecart.backend.repository.FoodItemRepository;
import com.cravecart.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

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
        System.out.println(">> Running Data Seeding...");

        // Create Default Admin if not exists
        String adminEmail = "admin@cravecart.com";
        Optional<User> existingAdmin = userRepository.findByEmail(adminEmail);
        
        if (existingAdmin.isEmpty()) {
            User admin = User.builder()
                    .name("System Admin")
                    .username("admin")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("admin123"))
                    .role("ADMIN")
                    .enabled(true)
                    .approved(true)
                    .build();
            userRepository.save(admin);
            System.out.println(">> Default Admin account created: " + adminEmail);
        } else {
            System.out.println(">> Admin account already exists.");
        }
    }
}
