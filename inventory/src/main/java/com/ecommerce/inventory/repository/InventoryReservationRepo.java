package com.ecommerce.inventory.repository;

import com.ecommerce.inventory.model.InventoryReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryReservationRepo extends JpaRepository<InventoryReservation,Long> {
    List<InventoryReservation> findByOrderId(Long orderId);
}
