package com.ecommerce.inventory.dto;

import com.ecommerce.inventory.model.InventoryStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InventoryResponse {
    private Long productId;
    private int totalQuantity;
    private int reservedQuantity;
    private int availableQuantity;
    private int sold;
    private InventoryStatus status;
}
