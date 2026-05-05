package com.cravecart.backend.service.impl;

import com.cravecart.backend.dto.UserRegistrationDTO;
import com.cravecart.backend.entity.User;
import com.cravecart.backend.repository.UserRepository;
import com.cravecart.backend.repository.RestaurantRepository;
import com.cravecart.backend.service.EmailService;
import com.cravecart.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final RestaurantRepository restaurantRepository;

    @Override
    public void registerUser(UserRegistrationDTO registrationDTO) {
        String randomCode = UUID.randomUUID().toString();
        
        User user = User.builder()
                .name(registrationDTO.getName())
                .username(registrationDTO.getUsername())
                .email(registrationDTO.getEmail())
                .password(passwordEncoder.encode(registrationDTO.getPassword()))
                .role(registrationDTO.getRole())
                .verificationCode(randomCode)
                .enabled(false)
                .approved(registrationDTO.getRole().equals("CUSTOMER")) // Customers auto-approved
                .build();

        User savedUser = userRepository.save(user);

        if (registrationDTO.getRole().equals("RESTAURANT_OWNER")) {
            com.cravecart.backend.entity.Restaurant restaurant = new com.cravecart.backend.entity.Restaurant();
            restaurant.setName(registrationDTO.getRestaurantName() != null ? registrationDTO.getRestaurantName() : "My Restaurant");
            restaurant.setAddress(registrationDTO.getRestaurantAddress());
            restaurant.setImageUrl(registrationDTO.getRestaurantImageUrl());
            restaurant.setOwner(savedUser);
            restaurantRepository.save(restaurant);
        }

        try {
            emailService.sendVerificationEmail(user.getEmail(), user.getName(), randomCode);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public User validateUser(String email, String password) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                if (user.getEnabled() == null || !user.getEnabled()) {
                    throw new RuntimeException("Please verify your email before logging in.");
                }
                if (user.getApproved() == null || !user.getApproved()) {
                    throw new RuntimeException("Your account is pending admin approval.");
                }
                return user;
            }
        }
        return null;
    }

    @Override
    public boolean verify(String verificationCode, String email) {
        return verifyAndGetUser(verificationCode, email) != null;
    }

    @Override
    public User verifyAndGetUser(String verificationCode, String email) {
        User user = userRepository.findByVerificationCode(verificationCode);
        if (user == null && email != null) {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent() && userOpt.get().getEnabled() != null && userOpt.get().getEnabled()) {
                return userOpt.get();
            }
            return null;
        }
        if (user != null) {
            user.setVerificationCode(null);
            user.setEnabled(true);
            return userRepository.save(user);
        }
        return null;
    }

    @Override
    public List<User> getPendingOwners() {
        return userRepository.findByRoleAndApproved("RESTAURANT_OWNER", false);
    }

    @Override
    public void approveUser(Long id) {
        User user = getUserById(id);
        user.setApproved(true);
        userRepository.save(user);
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);
        user.setName(userDetails.getName());
        user.setAddress(userDetails.getAddress());
        user.setPhoneNumber(userDetails.getPhoneNumber());
        return userRepository.save(user);
    }
}