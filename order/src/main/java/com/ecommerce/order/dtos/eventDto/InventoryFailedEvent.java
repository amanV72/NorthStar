package com.ecommerce.order.dtos.eventDto;

import lombok.AllArgsConstructor;
import lombok.Data;


@Data
@AllArgsConstructor
public class InventoryFailedEvent implements OrderCancellationEvent{
    private Long orderId;
    private String reason;
}
