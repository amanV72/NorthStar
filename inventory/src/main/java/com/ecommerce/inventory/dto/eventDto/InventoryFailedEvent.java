package com.ecommerce.inventory.dto.eventDto;

import lombok.AllArgsConstructor;
import lombok.Data;


@Data
@AllArgsConstructor
public class InventoryFailedEvent {
    private Long orderId;
    private String reason;
}
