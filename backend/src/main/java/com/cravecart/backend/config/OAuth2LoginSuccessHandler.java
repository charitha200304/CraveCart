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
        
        // Determine the frontend base URL dynamically to support mobile devices (IP address vs localhost)
        String host = request.getHeader("Host"); // e.g. "localhost:8080" or "192.168.1.5:8080"
        String frontendUrl = "http://localhost:5173"; // Default fallback
        
        if (host != null) {
            String domain = host.split(":")[0];
            frontendUrl = "http://" + domain + ":5173";
        }

        if (user.getEnabled() == null || !user.getEnabled()) {
            String encodedEmail = URLEncoder.encode(email, StandardCharsets.UTF_8);
            String targetUrl = frontendUrl + "/verify?status=pending&email=" + encodedEmail;
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
            return;
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        String token = jwtService.generateToken(userDetails);

        String encodedEmail = URLEncoder.encode(email, StandardCharsets.UTF_8);
        String encodedName  = URLEncoder.encode(user.getName() != null ? user.getName() : "", StandardCharsets.UTF_8);

        String targetUrl = frontendUrl + "/oauth-redirect"
                + "?token=" + token
                + "&id=" + user.getId()
                + "&email=" + encodedEmail
                + "&name=" + encodedName
                + "&role=" + user.getRole();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
