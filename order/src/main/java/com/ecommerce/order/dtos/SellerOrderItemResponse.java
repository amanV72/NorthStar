package com.ecommerce.order.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SellerOrderItemResponse {
    private Long productId;
    private Integer quantity;
    private Long price;
    private Long totalPrice;
}
