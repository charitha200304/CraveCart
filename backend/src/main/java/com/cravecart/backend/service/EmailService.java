package com.cravecart.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${resend.api.key}")
    private String apiKey;

    @Value("${resend.sender.email}")
    private String senderEmail;

    @Value("${resend.sender.name}")
    private String senderName;

    @Async
    public void sendVerificationEmail(String toEmail, String name, String verificationCode) {
        System.out.println(">> Sending Resend HTTP verification email to: [" + toEmail + "]");
        
        String frontendUrl = System.getenv().getOrDefault("FRONTEND_URL", "http://localhost:5173");
        String verifyURL = frontendUrl + "/verify?code=" + verificationCode + "&email=" + toEmail;

        String htmlContent = String.format(
            "<h3>Welcome to CraveCart, %s!</h3>" +
            "<p>Please click the link below to verify your registration:</p>" +
            "<h4><a href='%s'>VERIFY MY ACCOUNT</a></h4>" +
            "<p>Thank you,<br>The CraveCart Team</p>", 
            name, verifyURL
        );

        sendHtmlEmail(toEmail, "Please verify your registration", htmlContent);
    }

    @Async
    public void sendPasswordResetEmail(String toEmail, String name, String resetToken) {
        System.out.println(">> Sending Resend HTTP password reset email to: [" + toEmail + "]");
        
        String frontendUrl = System.getenv().getOrDefault("FRONTEND_URL", "http://localhost:5173");
        String resetURL = frontendUrl + "/reset-password?token=" + resetToken;

        String htmlContent = String.format(
            "<h3>Reset Your Password</h3>" +
            "<p>Dear %s, click the link below to set a new password:</p>" +
            "<h4><a href='%s'>RESET MY PASSWORD</a></h4>" +
            "<p>If you did not request this, please ignore this email.</p>", 
            name, resetURL
        );

        sendHtmlEmail(toEmail, "Reset Your Password - CraveCart", htmlContent);
    }

    @Async
    public void sendOrderReceiptEmail(String toEmail, String name, com.cravecart.backend.entity.Order order) {
        System.out.println(">> Sending Resend HTTP order receipt email to: [" + toEmail + "]");

        StringBuilder itemsHtml = new StringBuilder();
        if (order.getItems() != null) {
            for (com.cravecart.backend.entity.OrderItem item : order.getItems()) {
                itemsHtml.append(String.format(
                    "<tr>" +
                    "<td style='padding: 10px; border-bottom: 1px solid #ddd;'>%s</td>" +
                    "<td style='padding: 10px; border-bottom: 1px solid #ddd; text-align: center;'>$%.2f</td>" +
                    "<td style='padding: 10px; border-bottom: 1px solid #ddd; text-align: center;'>%d</td>" +
                    "<td style='padding: 10px; border-bottom: 1px solid #ddd; text-align: right;'>$%.2f</td>" +
                    "</tr>",
                    item.getFoodItem().getName(),
                    item.getFoodItem().getPrice(),
                    item.getQuantity(),
                    item.getPrice()
                ));
            }
        }

        String htmlContent = String.format(
            "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;'>" +
            "  <div style='text-align: center; margin-bottom: 20px;'>" +
            "    <h2 style='color: #E23744; margin: 0;'>CraveCart</h2>" +
            "    <p style='color: #666; margin: 5px 0 0 0;'>Your Order Confirmation</p>" +
            "  </div>" +
            "  <p>Dear <strong>%s</strong>,</p>" +
            "  <p>Thank you for ordering from <strong>%s</strong>! Your order has been placed successfully. Here is your receipt:</p>" +
            "  <div style='margin: 20px 0;'>" +
            "    <strong>Order ID:</strong> #%d<br>" +
            "    <strong>Order Date:</strong> %s" +
            "  </div>" +
            "  <table style='width: 100%%; border-collapse: collapse; margin-bottom: 20px;'>" +
            "    <thead>" +
            "      <tr style='background-color: #f8f8f8;'>" +
            "        <th style='padding: 10px; border-bottom: 2px solid #ddd; text-align: left;'>Item</th>" +
            "        <th style='padding: 10px; border-bottom: 2px solid #ddd; text-align: center;'>Unit Price</th>" +
            "        <th style='padding: 10px; border-bottom: 2px solid #ddd; text-align: center;'>Qty</th>" +
            "        <th style='padding: 10px; border-bottom: 2px solid #ddd; text-align: right;'>Total</th>" +
            "      </tr>" +
            "    </thead>" +
            "    <tbody>" +
            "      %s" +
            "    </tbody>" +
            "  </table>" +
            "  <div style='text-align: right; margin-bottom: 20px; font-size: 16px;'>" +
            "    <strong>Total Amount:</strong> <span style='font-size: 18px; color: #E23744;'>$%.2f</span>" +
            "  </div>" +
            "  <div style='background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin-bottom: 20px;'>" +
            "    <strong style='display: block; margin-bottom: 5px;'>Delivery Information:</strong>" +
            "    <strong>Address:</strong> %s<br>" +
            "    <strong>Contact:</strong> %s<br>" +
            "    <strong>Payment Method:</strong> %s" +
            "  </div>" +
            "  <p style='color: #666; font-size: 13px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;'>" +
            "    We hope you enjoy your meal! If you have any questions, please contact our support team.<br>" +
            "    &copy; CraveCart. All Rights Reserved." +
            "  </p>" +
            "</div>",
            name,
            order.getRestaurant() != null ? order.getRestaurant().getName() : "CraveCart Partner",
            order.getId(),
            order.getOrderDate() != null ? order.getOrderDate().toString() : "Just now",
            itemsHtml.toString(),
            order.getTotalAmount(),
            order.getDeliveryAddress() != null ? order.getDeliveryAddress() : "N/A",
            order.getContactNumber() != null ? order.getContactNumber() : "N/A",
            order.getPaymentMethod() != null ? order.getPaymentMethod() : "N/A"
        );

        sendHtmlEmail(toEmail, "Your CraveCart Order Receipt #" + order.getId(), htmlContent);
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            if (apiKey == null || apiKey.trim().isEmpty()) {
                System.err.println(">> Resend API key is not configured. Skipping email send.");
                return;
            }

            String url = "https://api.resend.com/emails";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            // Recipient list configuration
            List<String> toList = new ArrayList<>();
            toList.add(to);

            // Request body configuration
            Map<String, Object> body = new HashMap<>();
            body.put("from", senderName + " <" + senderEmail + ">");
            body.put("to", toList);
            body.put("subject", subject);
            body.put("html", htmlContent);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println(">> Resend HTTP Email sent successfully to: " + to);
            } else {
                System.err.println(">> Failed to send Resend HTTP email. Status: " + response.getStatusCode() + ", Body: " + response.getBody());
            }
        } catch (Exception e) {
            System.err.println(">> Failed to send Resend HTTP email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
