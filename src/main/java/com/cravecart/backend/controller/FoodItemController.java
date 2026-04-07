package com.cravecart.backend.controller;

import com.cravecart.backend.dto.FoodItemDTO;
import com.cravecart.backend.service.FoodItemService;
import com.cravecart.backend.service.ImageUploadService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/food")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class FoodItemController {

    private final FoodItemService foodItemService;
    private final ImageUploadService imageUploadService;

    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FoodItemDTO> addFoodItem(
            @RequestPart("food") String foodItemJson,
            @RequestPart("file") MultipartFile file) throws JsonProcessingException {

        ObjectMapper objectMapper = new ObjectMapper();
        FoodItemDTO dto = objectMapper.readValue(foodItemJson, FoodItemDTO.class);

        String imageUrl = imageUploadService.uploadImage(file);
        dto.setImageUrl(imageUrl);

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
    public ResponseEntity<FoodItemDTO> updateFood(@PathVariable Long id, @RequestBody FoodItemDTO dto) {
        return ResponseEntity.ok(foodItemService.updateFoodItem(id, dto));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteFood(@PathVariable Long id) {
        foodItemService.deleteFoodItem(id);
        return ResponseEntity.ok("Food item deleted successfully");
    }
}