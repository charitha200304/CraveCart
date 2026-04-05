package com.cravecart.backend.service;

import com.cravecart.backend.dto.FoodItemDTO;
import java.util.List;

public interface FoodItemService {
    FoodItemDTO addFoodItem(FoodItemDTO foodItemDTO); // Create
    List<FoodItemDTO> getAllFoodItems();             // Read (All)
    FoodItemDTO getFoodItemById(Long id);            // Read (Single)
    List<FoodItemDTO> getFoodByRestaurant(Long id);   // Read (By Restaurant)
    FoodItemDTO updateFoodItem(Long id, FoodItemDTO dto); // Update
    void deleteFoodItem(Long id);                    // Delete
}