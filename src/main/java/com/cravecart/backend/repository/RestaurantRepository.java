package com.cravecart.backend.repository;

import com.cravecart.backend.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    Optional<Restaurant> findByOwnerId(Long ownerId);
}