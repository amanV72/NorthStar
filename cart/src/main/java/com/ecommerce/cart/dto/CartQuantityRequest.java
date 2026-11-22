package com.ecommerce.cart.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class CartQuantityRequest {
    @NotNull
    @Positive
    private Integer quantity;
}
