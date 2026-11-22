package com.ecommerce.order.repositories;

import com.ecommerce.order.models.Order;
import com.ecommerce.order.models.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;
import java.util.List;

@Repository
public interface OrderRepo extends JpaRepository<Order, Long> {
    Optional<Order> findByIdAndUserId(Long id, String userId);

    List<Order> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Order> findDistinctByItems_SellerIdOrderByCreatedAtDesc(String sellerId);

    /**
     * Find active (unpaid) orders for a user to prevent duplicate order creation.
     */
    List<Order> findByUserIdAndStatusIn(String userId, Collection<OrderStatus> statuses);
}
