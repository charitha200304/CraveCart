package com.cravecart.backend.service.impl;

import com.cravecart.backend.dto.UserRegistrationDTO;
import com.cravecart.backend.entity.User;
import com.cravecart.backend.repository.UserRepository;
import com.cravecart.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Concrete implementation of the UserService.
 * Handles the mapping between DTOs and Entities and interacts with the Repository.
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public void registerUser(UserRegistrationDTO registrationDTO) {
        // Manually mapping DTO fields to the User Entity
        // In a larger project, you might use a library like MapStruct for this.
        User user = User.builder()
                .name(registrationDTO.getName())
                .username(registrationDTO.getUsername())
                .email(registrationDTO.getEmail())
                // Encrypting the raw password using BCrypt before saving
                .password(passwordEncoder.encode(registrationDTO.getPassword()))
                .role(registrationDTO.getRole())
                .build();

        userRepository.save(user);
    }

    @Override
    public User validateUser(String email, String password) {
        User user = userRepository.findByEmail(email);

        // Checking if the user exists and the provided password matches the stored hash
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            return user;
        }
        return null;
    }
}