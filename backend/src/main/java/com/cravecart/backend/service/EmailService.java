package com.cravecart.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final RestTemplate restTemplate;
    private final String RESEND_API_URL = "https://api.resend.com/emails";

    @Async
    public void sendVerificationEmail(String toEmail, String name, String verificationCode) {
        System.out.println(">> Sending Resend verification email to: [" + toEmail + "]");
        
        String frontendUrl = System.getenv().getOrDefault("FRONTEND_URL", "http://localhost:5173");
        String verifyURL = frontendUrl + "/verify?code=" + verificationCode + "&email=" + toEmail;

        String htmlContent = String.format(
            "<h3>Welcome to CraveCart, %s!</h3>" +
            "<p>Please click the link below to verify your registration:</p>" +
            "<h4><a href='%s'>VERIFY MY ACCOUNT</a></h4>" +
            "<p>Thank you,<br>The CraveCart Team</p>", 
            name, verifyURL
        );

        sendApiEmail(toEmail, "Please verify your registration", htmlContent);
    }

    @Async
    public void sendPasswordResetEmail(String toEmail, String name, String resetToken) {
        System.out.println(">> Sending Resend password reset email to: [" + toEmail + "]");
        
        String frontendUrl = System.getenv().getOrDefault("FRONTEND_URL", "http://localhost:5173");
        String resetURL = frontendUrl + "/reset-password?token=" + resetToken;

        String htmlContent = String.format(
            "<h3>Reset Your Password</h3>" +
            "<p>Dear %s, click the link below to set a new password:</p>" +
            "<h4><a href='%s'>RESET MY PASSWORD</a></h4>" +
            "<p>If you did not request this, please ignore this email.</p>", 
            name, resetURL
        );

        sendApiEmail(toEmail, "Reset Your Password - CraveCart", htmlContent);
    }

    private void sendApiEmail(String to, String subject, String html) {
        try {
            String apiKey = System.getenv("RESEND_API_KEY");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("from", "CraveCart <onboarding@resend.dev>"); // Default for free tier
            body.put("to", to);
            body.put("subject", subject);
            body.put("html", html);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(RESEND_API_URL, request, String.class);
            
            System.out.println(">> Resend Email sent successfully to: " + to);
        } catch (Exception e) {
            System.err.println(">> Failed to send email via Resend: " + e.getMessage());
        }
    }
}
