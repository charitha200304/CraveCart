package com.cravecart.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for capturing login credentials.
 * Separation from the User entity adds a layer of security.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequestDTO {

    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    /**
     * If true, generates a long-lived token (30 days).
     * If false (default), generates a short-lived token (24 hours / session).
     */
    private boolean rememberMe = false;
}