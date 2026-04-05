package com.cravecart.backend.service;

import com.cravecart.backend.dto.UserRegistrationDTO;
import com.cravecart.backend.entity.User;

/**
 * Service Interface defining user-related business operations.
 * Using an interface is a best practice for loose coupling and testability.
 */
public interface UserService {

    /**
     * Registers a new user based on the provided registration data.
     *
     * @param registrationDTO Data transfer object containing user details.
     */
    void registerUser(UserRegistrationDTO registrationDTO);

    /**
     * Validates user credentials for authentication.
     * @param email User's email address.
     * @param password Raw password provided during login.
     * @return The User entity if valid, otherwise null.
     */
    User validateUser(String email, String password);
}