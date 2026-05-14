package com.cravecart.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendVerificationEmail(String toEmail, String name, String verificationCode) 
            throws MessagingException, UnsupportedEncodingException {
        System.out.println(">> Sending verification email to: [" + toEmail + "]");
        
        String subject = "Please verify your registration";
        String senderName = "CraveCart Team";
        String mailContent = "<p>Dear " + name + ",</p>";
        mailContent += "<p>Please click the link below to verify your registration:</p>";
        
        String frontendUrl = System.getenv().getOrDefault("FRONTEND_URL", "http://localhost:5173");
        String verifyURL = frontendUrl + "/verify?code=" + verificationCode + "&email=" + toEmail;
        
        mailContent += "<h3><a href=\"" + verifyURL + "\">VERIFY MY ACCOUNT</a></h3>";
        mailContent += "<p>Thank you,<br>The CraveCart Team</p>";

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        helper.setFrom("support@cravecart.com", senderName);
        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(mailContent, true);

        mailSender.send(message);
    }
    @Async
    public void sendPasswordResetEmail(String toEmail, String name, String resetToken) 
            throws MessagingException, UnsupportedEncodingException {
        System.out.println(">> Sending password reset email to: [" + toEmail + "]");
        
        String subject = "Reset Your Password - CraveCart";
        String senderName = "CraveCart Security";
        String mailContent = "<p>Dear " + name + ",</p>";
        mailContent += "<p>You have requested to reset your password. Please click the link below to set a new password:</p>";
        
        String frontendUrl = System.getenv().getOrDefault("FRONTEND_URL", "http://localhost:5173");
        String resetURL = frontendUrl + "/reset-password?token=" + resetToken;
        
        mailContent += "<h3><a href=\"" + resetURL + "\">RESET MY PASSWORD</a></h3>";
        mailContent += "<p>If you did not request a password reset, please ignore this email.</p>";
        mailContent += "<p>Thank you,<br>The CraveCart Team</p>";

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        helper.setFrom("security@cravecart.com", senderName);
        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(mailContent, true);

        mailSender.send(message);
    }
}
