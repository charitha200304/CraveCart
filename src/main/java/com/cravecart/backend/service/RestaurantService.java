package com.cravecart.backend.service;

import com.cravecart.backend.dto.RestaurantDTO;
import java.util.List;

public interface RestaurantService {
    RestaurantDTO addRestaurant(RestaurantDTO restaurantDTO);
    List<RestaurantDTO> getAllRestaurants();
    RestaurantDTO getRestaurantById(Long id);
    RestaurantDTO updateRestaurant(Long id, RestaurantDTO restaurantDTO);
    void deleteRestaurant(Long id);
}