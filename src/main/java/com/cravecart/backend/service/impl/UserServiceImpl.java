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
                .phoneNumber(registrationDTO.getPhoneNumber())
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
        
        // Check if email is changing
        if (!user.getEmail().equals(userDetails.getEmail())) {
            // Check if user is a Google user (based on password prefix)
            if (user.getPassword().startsWith("OAUTH2_USER_")) {
                throw new RuntimeException("Email managed by Google cannot be changed here.");
            }
            
            // Check if new email is already taken
            if (userRepository.findByEmail(userDetails.getEmail()).isPresent()) {
                throw new RuntimeException("Email already in use by another account.");
            }

            // Update email and trigger re-verification
            String randomCode = UUID.randomUUID().toString();
            user.setEmail(userDetails.getEmail());
            user.setUsername(userDetails.getEmail());
            user.setVerificationCode(randomCode);
            user.setEnabled(false);
            
            try {
                emailService.sendVerificationEmail(user.getEmail(), user.getName(), randomCode);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        user.setName(userDetails.getName());
        user.setAddress(userDetails.getAddress());
        user.setPhoneNumber(userDetails.getPhoneNumber());
        return userRepository.save(user);
    }

    @Override
    public void generatePasswordResetToken(String email) throws Exception {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            String token = UUID.randomUUID().toString();
            user.setResetPasswordToken(token);
            user.setResetPasswordTokenExpiry(java.time.LocalDateTime.now().plusHours(1));
            userRepository.save(user);

            emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), token);
        } else {
            // We throw a generic exception or do nothing to prevent email enumeration,
            // but for UX, sometimes it's okay to throw if needed. Let's throw for now.
            throw new RuntimeException("User not found with this email");
        }
    }

    @Override
    public void resetPassword(String token, String newPassword) throws Exception {
        Optional<User> userOptional = userRepository.findByResetPasswordToken(token);
        if (!userOptional.isPresent()) {
            throw new RuntimeException("Invalid token");
        }

        User user = userOptional.get();
        if (user.getResetPasswordTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Token has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        userRepository.save(user);
    }
}