package com.ecommerce.order.dtos;

import lombok.Data;


@Data
public class CartItemsResponse {
    private Long productId;
    private String sellerId;
    private Integer quantity;
    private Long price;
    private Long totalPrice;
}
