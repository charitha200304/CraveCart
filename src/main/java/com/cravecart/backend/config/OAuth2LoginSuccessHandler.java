package com.cravecart.backend.config;

import com.cravecart.backend.entity.User;
import com.cravecart.backend.repository.UserRepository;
import com.cravecart.backend.service.CustomUserDetailsService;
import com.cravecart.backend.service.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getEnabled() == null || !user.getEnabled()) {
            String encodedEmail = URLEncoder.encode(email, StandardCharsets.UTF_8);
            String targetUrl = "http://localhost:5173/verify?status=pending&email=" + encodedEmail;
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
            return;
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        String token = jwtService.generateToken(userDetails);

        String encodedEmail = URLEncoder.encode(email, StandardCharsets.UTF_8);
        String encodedName  = URLEncoder.encode(user.getName() != null ? user.getName() : "", StandardCharsets.UTF_8);

        String targetUrl = "http://localhost:5173/oauth-redirect"
                + "?token=" + token
                + "&id=" + user.getId()
                + "&email=" + encodedEmail
                + "&name=" + encodedName
                + "&role=" + user.getRole();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
