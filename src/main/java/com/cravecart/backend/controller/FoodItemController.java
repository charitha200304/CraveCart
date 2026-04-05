package com.cravecart.backend.controller;

import com.cravecart.backend.dto.FoodItemDTO;
import com.cravecart.backend.service.FoodItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/food")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class FoodItemController {

    private final FoodItemService foodItemService;

    @PostMapping("/add")
    public ResponseEntity<FoodItemDTO> addFoodItem(@Valid @RequestBody FoodItemDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(foodItemService.addFoodItem(dto));
    }

    @GetMapping("/all")
    public ResponseEntity<List<FoodItemDTO>> getAllFood() {
        return ResponseEntity.ok(foodItemService.getAllFoodItems());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodItemDTO> getFoodById(@PathVariable Long id) {
        return ResponseEntity.ok(foodItemService.getFoodItemById(id));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<FoodItemDTO> updateFood(@PathVariable Long id, @Valid @RequestBody FoodItemDTO dto) {
        return ResponseEntity.ok(foodItemService.updateFoodItem(id, dto));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteFood(@PathVariable Long id) {
        foodItemService.deleteFoodItem(id);
        return ResponseEntity.ok("Food item deleted successfully");
    }
}