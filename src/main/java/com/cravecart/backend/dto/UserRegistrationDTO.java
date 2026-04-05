package com.cravecart.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for User Registration.
 * This class ensures that incoming data from the frontend meets the required criteria
 * before reaching the service layer or database.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRegistrationDTO {

    @NotBlank(message = "Display name is required and cannot be empty")
    private String name;

    @NotBlank(message = "Username is required for profile identification")
    private String username;

    @NotBlank(message = "Email is a mandatory field")
    @Email(message = "Please provide a valid email address format")
    private String email;

    @NotBlank(message = "Password cannot be blank")
    @Size(min = 6, message = "Password must be at least 6 characters long for security")
    private String password;

    @NotBlank(message = "User role must be specified (e.g., CUSTOMER, ADMIN)")
    private String role;
}