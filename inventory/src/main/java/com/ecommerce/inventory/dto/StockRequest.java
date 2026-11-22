package com.ecommerce.inventory.dto;

import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class StockRequest {
    @Positive
    private int quantity;
}
