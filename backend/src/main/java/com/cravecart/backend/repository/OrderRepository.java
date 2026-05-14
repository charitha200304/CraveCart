package com.cravecart.backend.repository;

import com.cravecart.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o WHERE o.customer.id = :customerId")
    List<Order> findByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT o FROM Order o WHERE o.restaurant.id = :restaurantId")
    List<Order> findByRestaurantId(@Param("restaurantId") Long restaurantId);

    /**
     * Custom query method to find orders by customer ID and sort them by date in descending order.
     * This ensures the latest orders appear at the top of the history.
     */
    List<Order> findByCustomerIdOrderByOrderDateDesc(Long customerId);
}