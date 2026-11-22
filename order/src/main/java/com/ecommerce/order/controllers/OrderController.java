package com.ecommerce.order.controllers;


import com.ecommerce.order.dtos.OrderResponse;
import com.ecommerce.order.dtos.OrderResponseForPaymentId;
import com.ecommerce.order.dtos.OrderStatusUpdateRequest;
import com.ecommerce.order.dtos.SellerOrderResponse;
import com.ecommerce.order.services.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
@Tag(name = "Orders", description = "Create orders and inspect payment state")
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "List orders for the current customer")
    public ResponseEntity<List<OrderResponse>> getCustomerOrders(
            @RequestHeader("X-User-ID") String userId) {
        return ResponseEntity.ok(orderService.getOrdersForUser(userId));
    }

    @GetMapping("/seller")
    @Operation(summary = "List orders containing products owned by the current seller")
    public ResponseEntity<List<SellerOrderResponse>> getSellerOrders(
            @RequestHeader("X-User-ID") String sellerId) {
        return ResponseEntity.ok(orderService.getOrdersForSeller(sellerId));
    }

    @PatchMapping("/seller/{orderId}/status")
    @Operation(summary = "Mark a seller order as shipped or delivered")
    public ResponseEntity<SellerOrderResponse> updateSellerOrderStatus(
            @RequestHeader("X-User-ID") String sellerId,
            @PathVariable Long orderId,
            @Valid @RequestBody OrderStatusUpdateRequest request) {
        return orderService.updateSellerOrderStatus(sellerId, orderId, request.getStatus())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.badRequest().build());
    }

    @PostMapping
    @Operation(summary = "Create an order from the current user's cart")
    public ResponseEntity<OrderResponse> createOrder(@RequestHeader("X-User-ID") String userId){
       return orderService.createOrder(userId)
               .map(orderResponse -> new ResponseEntity<>(orderResponse,HttpStatus.CREATED))
               .orElseGet(()->ResponseEntity.badRequest().build());

    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get payment information for an order")
    public ResponseEntity<OrderResponseForPaymentId> getPaymentId(
            @RequestHeader("X-User-ID") String userId,
            @PathVariable Long orderId
    ){
        return orderService.getPaymentIdFromOrder(userId,orderId)
                .map(orderResponse -> new ResponseEntity<>(orderResponse,HttpStatus.CREATED))
                .orElseGet(()->ResponseEntity.badRequest().build());

    }

}
