package com.cravecart.backend.service.impl;

import com.cravecart.backend.dto.ReviewRequestDTO;
import com.cravecart.backend.dto.ReviewResponseDTO;
import com.cravecart.backend.entity.FoodItem;
import com.cravecart.backend.entity.Restaurant;
import com.cravecart.backend.entity.Review;
import com.cravecart.backend.entity.User;
import com.cravecart.backend.repository.FoodItemRepository;
import com.cravecart.backend.repository.RestaurantRepository;
import com.cravecart.backend.repository.ReviewRepository;
import com.cravecart.backend.repository.UserRepository;
import com.cravecart.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final FoodItemRepository foodItemRepository;

    @Override
    @Transactional
    public ReviewResponseDTO addReview(ReviewRequestDTO request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"CUSTOMER".equals(user.getRole())) {
            throw new RuntimeException("Only customers can leave reviews");
        }

        Review review = Review.builder()
                .rating(request.getRating())
                .comment(request.getComment())
                .user(user)
                .build();

        if (request.getRestaurantId() != null) {
            Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                    .orElseThrow(() -> new RuntimeException("Restaurant not found"));
            review.setRestaurant(restaurant);
            Review savedReview = reviewRepository.save(review);
            updateRestaurantRating(restaurant);
            return mapToResponseDTO(savedReview);
        } else if (request.getFoodItemId() != null) {
            FoodItem foodItem = foodItemRepository.findById(request.getFoodItemId())
                    .orElseThrow(() -> new RuntimeException("Food item not found"));
            review.setFoodItem(foodItem);
            Review savedReview = reviewRepository.save(review);
            updateFoodItemRating(foodItem);
            return mapToResponseDTO(savedReview);
        } else {
            throw new RuntimeException("Must provide either restaurantId or foodItemId");
        }
    }

    @Override
    public List<ReviewResponseDTO> getRestaurantReviews(Long restaurantId) {
        return reviewRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewResponseDTO> getFoodItemReviews(Long foodItemId) {
        return reviewRepository.findByFoodItemIdOrderByCreatedAtDesc(foodItemId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    private void updateRestaurantRating(Restaurant restaurant) {
        List<Review> reviews = reviewRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurant.getId());
        if (reviews.isEmpty()) {
            restaurant.setAverageRating(0.0);
            restaurant.setReviewCount(0);
        } else {
            double average = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
            restaurant.setAverageRating(Math.round(average * 10.0) / 10.0);
            restaurant.setReviewCount(reviews.size());
        }
        restaurantRepository.save(restaurant);
    }

    private void updateFoodItemRating(FoodItem foodItem) {
        List<Review> reviews = reviewRepository.findByFoodItemIdOrderByCreatedAtDesc(foodItem.getId());
        if (reviews.isEmpty()) {
            foodItem.setAverageRating(0.0);
            foodItem.setReviewCount(0);
        } else {
            double average = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
            foodItem.setAverageRating(Math.round(average * 10.0) / 10.0);
            foodItem.setReviewCount(reviews.size());
        }
        foodItemRepository.save(foodItem);
    }

    private ReviewResponseDTO mapToResponseDTO(Review review) {
        return ReviewResponseDTO.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .reviewerName(review.getUser().getName())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
