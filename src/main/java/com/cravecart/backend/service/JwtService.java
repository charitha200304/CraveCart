package com.cravecart.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class JwtService {

    private static final String SECRET_KEY = "YourSuperSecretKeyForCraveCartProjectWhichShouldBeVeryLong";

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Token expiry constants
    private static final long SESSION_EXPIRY_MS    = 1000L * 60 * 60 * 24;       // 24 hours
    private static final long REMEMBER_ME_EXPIRY_MS = 1000L * 60 * 60 * 24 * 30; // 30 days

    /**
     * Generates a standard short-lived token (24 hours).
     * Kept for backward compatibility (email verification flow, OAuth2, etc.)
     */
    public String generateToken(UserDetails userDetails) {
        return generateToken(userDetails, false);
    }

    /**
     * Generates a token with expiry based on the rememberMe flag.
     * rememberMe=true  → 30-day token (stored in localStorage on frontend)
     * rememberMe=false → 24-hour token (stored in sessionStorage on frontend)
     */
    public String generateToken(UserDetails userDetails, boolean rememberMe) {
        Map<String, Object> claims = new HashMap<>();

        // Adding roles to JWT claims for role-based authorization
        claims.put("roles", userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));

        long expiryMs = rememberMe ? REMEMBER_ME_EXPIRY_MS : SESSION_EXPIRY_MS;

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiryMs))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username)) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}