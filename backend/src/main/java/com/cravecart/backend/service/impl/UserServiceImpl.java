package com.cravecart.backend.service.impl;

import com.cravecart.backend.dto.UserRegistrationDTO;
import com.cravecart.backend.entity.User;
import com.cravecart.backend.repository.UserRepository;
import com.cravecart.backend.repository.RestaurantRepository;
import com.cravecart.backend.service.EmailService;
import com.cravecart.backend.repository.OtpCodeRepository;
import com.cravecart.backend.entity.OtpCode;
import java.time.LocalDateTime;
import java.util.Random;
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
    private final OtpCodeRepository otpCodeRepository;

    @Override
    public void registerUser(UserRegistrationDTO registrationDTO) {
        // For restaurant owners, ensure OTP has been verified before proceeding
        if ("RESTAURANT_OWNER".equals(registrationDTO.getRole())) {
            OtpCode otp = otpCodeRepository.findById(registrationDTO.getEmail()).orElse(null);
            if (otp == null || !Boolean.TRUE.equals(otp.getVerified())) {
                throw new RuntimeException("Email not verified via OTP. Please verify before registering.");
            }
            // OTP verified; remove it after use
            otpCodeRepository.delete(otp);
        }

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
            // Send a warm welcome email to customers
            if (registrationDTO.getRole().equals("CUSTOMER")) {
                emailService.sendWelcomeEmail(user.getEmail(), user.getName());
            }
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

    // OTP flow methods
    @Override
    public void sendOtp(String email) {
        // Generate a 6-digit numeric OTP
        String otpCode = String.format("%06d", new Random().nextInt(1_000_000));
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(5);
        OtpCode otp = OtpCode.builder()
                .email(email)
                .code(otpCode)
                .expiryTime(expiry)
                .verified(false)
                .build();
        otpCodeRepository.save(otp);
        emailService.sendVerificationOtpEmail(email, otpCode);
    }

    @Override
    public boolean verifyOtp(String email, String code) {
        OtpCode otp = otpCodeRepository.findById(email).orElse(null);
        if (otp != null && otp.getCode().equals(code) && otp.getExpiryTime().isAfter(LocalDateTime.now())) {
            otp.setVerified(true);
            otpCodeRepository.save(otp);
            return true;
        }
        return false;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public void deleteUser(Long id) {
        User user = getUserById(id);
        if ("RESTAURANT_OWNER".equals(user.getRole())) {
            restaurantRepository.findByOwnerId(id).ifPresent(restaurantRepository::delete);
        }
        userRepository.deleteById(id);
    }

    @Override
    public User toggleUserStatus(Long id) {
        User user = getUserById(id);
        user.setEnabled(!Boolean.TRUE.equals(user.getEnabled()));
        return userRepository.save(user);
    }

    @Override
    public User changeUserRole(Long id, String role) {
        User user = getUserById(id);
        user.setRole(role);
        return userRepository.save(user);
    }
}