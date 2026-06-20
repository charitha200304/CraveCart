package com.cravecart.backend.controller;

import com.cravecart.backend.dto.AuthResponse;
import com.cravecart.backend.dto.LoginRequestDTO;
import com.cravecart.backend.dto.UserRegistrationDTO;
import com.cravecart.backend.entity.User;
import com.cravecart.backend.service.JwtService;
import com.cravecart.backend.service.UserService;
import com.cravecart.backend.service.CustomUserDetailsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = {"http://localhost:5173", "https://crave-cart-delta.vercel.app"})
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserRegistrationDTO registrationDTO) {
        try {
            userService.registerUser(registrationDTO);
            Map<String, String> response = new HashMap<>();
            response.put("message", "User registered successfully!");
            response.put("email", registrationDTO.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequestDTO loginRequest) {
        User authenticatedUser = userService.validateUser(loginRequest.getEmail(), loginRequest.getPassword());

        if (authenticatedUser != null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(authenticatedUser.getEmail());
            // Pass rememberMe flag: true = 30-day token, false = 24-hour token
            String token = jwtService.generateToken(userDetails, loginRequest.isRememberMe());

            AuthResponse response = AuthResponse.builder()
                    .id(authenticatedUser.getId())
                    .token(token)
                    .email(authenticatedUser.getEmail())
                    .role(authenticatedUser.getRole())
                    .name(authenticatedUser.getName())
                    .build();

            return ResponseEntity.ok(response);
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid Email or Password!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    // OTP endpoints
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestParam String email) {
        try {
            userService.sendOtp(email);
            Map<String, String> response = new HashMap<>();
            response.put("message", "OTP sent to email.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to send OTP: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestParam String email, @RequestParam String code) {
        boolean verified = userService.verifyOtp(email, code);
        if (verified) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "OTP verified successfully.");
            return ResponseEntity.ok(response);
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid or expired OTP.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequestDTO loginRequest) {
        User authenticatedUser = userService.validateUser(loginRequest.getEmail(), loginRequest.getPassword());

        if (authenticatedUser != null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(authenticatedUser.getEmail());
            // Pass rememberMe flag: true = 30-day token, false = 24-hour token
            String token = jwtService.generateToken(userDetails, loginRequest.isRememberMe());

            AuthResponse response = AuthResponse.builder()
                    .id(authenticatedUser.getId())
                    .token(token)
                    .email(authenticatedUser.getEmail())
                    .role(authenticatedUser.getRole())
                    .name(authenticatedUser.getName())
                    .build();

            return ResponseEntity.ok(response);
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid Email or Password!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyUser(@RequestParam("code") String code, 
                                      @RequestParam(value = "email", required = false) String email) {
        User user = userService.verifyAndGetUser(code, email);
        if (user != null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            String token = jwtService.generateToken(userDetails);

            AuthResponse response = AuthResponse.builder()
                    .id(user.getId())
                    .token(token)
                    .email(user.getEmail())
                    .role(user.getRole())
                    .name(user.getName())
                    .build();

            return ResponseEntity.ok(response);
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Verification failed.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/admin/pending-owners")
    public ResponseEntity<?> getPendingOwners() {
        return ResponseEntity.ok(userService.getPendingOwners());
    }

    @PostMapping("/admin/approve/{id}")
    public ResponseEntity<?> approveOwner(@PathVariable Long id) {
        userService.approveUser(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User approved successfully!");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody com.cravecart.backend.dto.ForgotPasswordRequestDTO request) {
        try {
            userService.generatePasswordResetToken(request.getEmail());
            Map<String, String> response = new HashMap<>();
            response.put("message", "If an account with that email exists, a password reset link has been sent.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody com.cravecart.backend.dto.ResetPasswordRequestDTO request) {
        try {
            userService.resetPassword(request.getToken(), request.getNewPassword());
            Map<String, String> response = new HashMap<>();
            response.put("message", "Password has been reset successfully. You can now login.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // ── Admin CRUD ────────────────────────────────────────────
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User deleted successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/admin/{id}/toggle")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleUserStatus(id));
    }

    @PutMapping("/admin/{id}/role")
    public ResponseEntity<?> changeUserRole(@PathVariable Long id, @RequestParam String role) {
        return ResponseEntity.ok(userService.changeUserRole(id, role));
    }
}