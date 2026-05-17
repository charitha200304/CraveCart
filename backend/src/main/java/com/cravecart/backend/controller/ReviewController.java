package com.cravecart.backend.controller;

import com.cravecart.backend.dto.ReviewRequestDTO;
import com.cravecart.backend.dto.ReviewResponseDTO;
import com.cravecart.backend.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = {"http://localhost:5173", "https://cravecart-frontend.vercel.app"})
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<?> addReview(@Valid @RequestBody ReviewRequestDTO request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        String userEmail = authentication.getName();
        try {
            ReviewResponseDTO response = reviewService.addReview(request, userEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/restaurant/{id}")
    public ResponseEntity<List<ReviewResponseDTO>> getRestaurantReviews(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getRestaurantReviews(id));
    }

    @GetMapping("/food/{id}")
    public ResponseEntity<List<ReviewResponseDTO>> getFoodItemReviews(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getFoodItemReviews(id));
    }

    // Admin endpoints
    @GetMapping("/all")
    public ResponseEntity<List<ReviewResponseDTO>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok("Review deleted");
    }
}
