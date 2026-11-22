package com.ecommerce.inventory.dto.eventDto;

import lombok.AllArgsConstructor;
import lombok.Data;


@Data
@AllArgsConstructor
public class InventoryReservedEvent {
    private Long orderId;
    private String userId;
    private Long totalAmount;
    private boolean simulateFailure;
}
