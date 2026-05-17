package com.cravecart.backend.service;

import com.cravecart.backend.dto.ReviewRequestDTO;
import com.cravecart.backend.dto.ReviewResponseDTO;

import java.util.List;

public interface ReviewService {
    ReviewResponseDTO addReview(ReviewRequestDTO request, String userEmail);
    List<ReviewResponseDTO> getRestaurantReviews(Long restaurantId);
    List<ReviewResponseDTO> getFoodItemReviews(Long foodItemId);
    List<ReviewResponseDTO> getAllReviews();
    void deleteReview(Long id);
}
