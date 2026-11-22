package com.ecommerce.cart.dto;

import lombok.Data;


@Data
public class CartItemsResponse {
    private String productId;
    private String sellerId;
    private Integer quantity;
    private Long price;
    private Long totalPrice;
}
