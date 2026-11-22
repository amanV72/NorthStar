package com.ecommerce.cart.dto;

import lombok.Data;

import java.util.List;

@Data
public class CartResponse {
    private String userId;
    private List<CartItemsResponse> items;
    private Long cartTotal;
}
