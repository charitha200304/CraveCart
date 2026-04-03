package com.cravecart.backend.controller;

import com.cravecart.backend.entity.FoodItem;
import com.cravecart.backend.repository.FoodItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/food")
@CrossOrigin(origins = "http://localhost:5173")
public class FoodItemController {

    @Autowired
    private FoodItemRepository foodItemRepository;

    @PostMapping("/add")
    public FoodItem addFoodItem(@RequestBody FoodItem foodItem) {
        return foodItemRepository.save(foodItem);
    }

    @GetMapping("/restaurant/{restaurantId}")
    public List<FoodItem> getFoodByRestaurant(@PathVariable Long restaurantId) {
        return foodItemRepository.findByRestaurantId(restaurantId);
    }
}