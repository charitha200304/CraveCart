package com.cravecart.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantDTO {
    private Long id;
    private String name;
    private String address;
    private String contactNumber;
    private String description;
    private String imageUrl;
    private String category;
    private Long ownerId;
    private Double averageRating;
    private Integer reviewCount;
    private Boolean approved;
}