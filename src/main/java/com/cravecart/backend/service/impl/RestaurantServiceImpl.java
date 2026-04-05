package com.cravecart.backend.service.impl;

import com.cravecart.backend.dto.RestaurantDTO;
import com.cravecart.backend.entity.Restaurant;
import com.cravecart.backend.entity.User;
import com.cravecart.backend.repository.RestaurantRepository;
import com.cravecart.backend.repository.UserRepository;
import com.cravecart.backend.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantServiceImpl implements RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

    @Override
    public RestaurantDTO addRestaurant(RestaurantDTO dto) {
        User owner = userRepository.findById(dto.getOwnerId())
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        Restaurant restaurant = new Restaurant();
        mapDtoToEntity(dto, restaurant);
        restaurant.setOwner(owner);

        Restaurant saved = restaurantRepository.save(restaurant);
        return mapEntityToDto(saved);
    }

    @Override
    public List<RestaurantDTO> getAllRestaurants() {
        return restaurantRepository.findAll().stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    @Override
    public RestaurantDTO getRestaurantById(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        return mapEntityToDto(restaurant);
    }

    @Override
    public RestaurantDTO updateRestaurant(Long id, RestaurantDTO dto) {
        Restaurant existing = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        mapDtoToEntity(dto, existing);
        return mapEntityToDto(restaurantRepository.save(existing));
    }

    @Override
    public void deleteRestaurant(Long id) {
        if (!restaurantRepository.existsById(id)) {
            throw new RuntimeException("Restaurant not found");
        }
        restaurantRepository.deleteById(id);
    }

    // Helper Mappings
    private void mapDtoToEntity(RestaurantDTO dto, Restaurant entity) {
        entity.setName(dto.getName());
        entity.setAddress(dto.getAddress());
        entity.setContactNumber(dto.getContactNumber());
        entity.setDescription(dto.getDescription());
        entity.setImageUrl(dto.getImageUrl());
    }

    private RestaurantDTO mapEntityToDto(Restaurant entity) {
        return RestaurantDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .address(entity.getAddress())
                .contactNumber(entity.getContactNumber())
                .description(entity.getDescription())
                .imageUrl(entity.getImageUrl())
                .ownerId(entity.getOwner().getId())
                .build();
    }
}