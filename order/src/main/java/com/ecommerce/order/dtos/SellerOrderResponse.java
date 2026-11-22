package com.ecommerce.order.dtos;

import com.ecommerce.order.models.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class SellerOrderResponse {
    private Long orderId;
    private String customerId;
    private OrderStatus status;
    private Long sellerTotal;
    private List<SellerOrderItemResponse> items;
    private LocalDateTime createdAt;
}
