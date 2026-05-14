package com.cravecart.backend.service.impl;

import com.cravecart.backend.dto.FoodItemDTO;
import com.cravecart.backend.entity.FoodItem;
import com.cravecart.backend.entity.Restaurant;
import com.cravecart.backend.repository.FoodItemRepository;
import com.cravecart.backend.repository.RestaurantRepository;
import com.cravecart.backend.service.FoodItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FoodItemServiceImpl implements FoodItemService {

    private final FoodItemRepository foodItemRepository;
    private final RestaurantRepository restaurantRepository;

    @Override
    public FoodItemDTO addFoodItem(FoodItemDTO dto) {
        Restaurant restaurant = restaurantRepository.findById(dto.getRestaurantId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        FoodItem foodItem = new FoodItem();
        mapDtoToEntity(dto, foodItem);
        foodItem.setRestaurant(restaurant);

        FoodItem saved = foodItemRepository.save(foodItem);
        dto.setId(saved.getId());
        return dto;
    }

    @Override
    public List<FoodItemDTO> getAllFoodItems() {
        return foodItemRepository.findAll().stream()
                .map(this::mapEntityToDto).collect(Collectors.toList());
    }

    @Override
    public FoodItemDTO getFoodItemById(Long id) {
        FoodItem item = foodItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food item not found"));
        return mapEntityToDto(item);
    }

    @Override
    public List<FoodItemDTO> getFoodByRestaurant(Long restaurantId) {
        return foodItemRepository.findByRestaurantId(restaurantId).stream()
                .map(this::mapEntityToDto).collect(Collectors.toList());
    }

    @Override
    public FoodItemDTO updateFoodItem(Long id, FoodItemDTO dto) {
        FoodItem existingItem = foodItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food item not found"));

        mapDtoToEntity(dto, existingItem);
        foodItemRepository.save(existingItem);
        return mapEntityToDto(existingItem);
    }

    @Override
    public void deleteFoodItem(Long id) {
        if (!foodItemRepository.existsById(id)) {
            throw new RuntimeException("Food item not found");
        }
        foodItemRepository.deleteById(id);
    }

    // Helper methods for Mapping
    private void mapDtoToEntity(FoodItemDTO dto, FoodItem entity) {
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setPrice(dto.getPrice());
        entity.setCategory(dto.getCategory());
        entity.setImageUrl(dto.getImageUrl());
        entity.setStockQuantity(dto.getStockQuantity());
    }

    private FoodItemDTO mapEntityToDto(FoodItem entity) {
        return FoodItemDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .price(entity.getPrice())
                .category(entity.getCategory())
                .imageUrl(entity.getImageUrl())
                .stockQuantity(entity.getStockQuantity())
                .restaurantId(entity.getRestaurant().getId())
                .averageRating(entity.getAverageRating())
                .reviewCount(entity.getReviewCount())
                .build();
    }
}