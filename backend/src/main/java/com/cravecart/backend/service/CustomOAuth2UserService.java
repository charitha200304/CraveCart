package com.cravecart.backend.service;

import com.cravecart.backend.entity.User;
import com.cravecart.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import java.util.Optional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final EmailService emailService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        // Try to get role from original request params
        String role = "CUSTOMER"; // Default
        ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
        if (attr != null) {
            HttpServletRequest request = attr.getRequest();
            String roleParam = request.getParameter("role");
            if (roleParam != null && !roleParam.isEmpty()) {
                role = roleParam.toUpperCase();
            }
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;

        if (userOptional.isEmpty()) {
            String randomCode = java.util.UUID.randomUUID().toString();
            user = User.builder()
                    .email(email)
                    .name(name)
                    .username(email)
                    .password("OAUTH2_USER_" + java.util.UUID.randomUUID().toString())
                    .role(role)
                    .verificationCode(randomCode)
                    .enabled(false)
                    .build();
            userRepository.save(user);
            sendEmailSafely(email, name, randomCode);
        } else {
            user = userOptional.get();
            // If user exists but is not verified, and we have a new role, maybe update it? 
            // For now just resend email.
            if (user.getEnabled() == null || !user.getEnabled()) {
                String newCode = java.util.UUID.randomUUID().toString();
                user.setVerificationCode(newCode);
                userRepository.save(user);
                sendEmailSafely(email, name, newCode);
            }
        }
        return oAuth2User;
    }

    private void sendEmailSafely(String email, String name, String code) {
        try {
            emailService.sendVerificationEmail(email, name, code);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}