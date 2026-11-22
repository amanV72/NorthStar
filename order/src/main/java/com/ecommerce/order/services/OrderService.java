package com.ecommerce.order.services;

import com.ecommerce.order.clients.CartServiceClient;
import com.ecommerce.order.dtos.CartResponse;
import com.ecommerce.order.dtos.OrderResponseForPaymentId;
import com.ecommerce.order.dtos.eventDto.*;
import com.ecommerce.order.dtos.OrderItemDTO;
import com.ecommerce.order.dtos.OrderResponse;
import com.ecommerce.order.dtos.SellerOrderItemResponse;
import com.ecommerce.order.dtos.SellerOrderResponse;
import com.ecommerce.order.models.OrderStatus;
import com.ecommerce.order.models.Order;
import com.ecommerce.order.models.OrderItem;
import com.ecommerce.order.repositories.OrderRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepo orderRepo;
    private final CartServiceClient cartServiceClient;
    private final StreamBridge streamBridge;

    /**
     * Statuses that represent an "active" order which hasn't been paid or cancelled.
     * If the user already has one of these, we return it instead of creating a duplicate.
     */
    private static final Set<OrderStatus> ACTIVE_UNPAID_STATUSES = Set.of(
            OrderStatus.CREATED,
            OrderStatus.PAYMENT_PENDING
    );

    @Transactional
    public Optional<OrderResponse> createOrder(String userId) {
        // ── Guard: prevent duplicate orders ──────────────────────────────
        List<Order> existingActive = orderRepo.findByUserIdAndStatusIn(userId, ACTIVE_UNPAID_STATUSES);
        if (!existingActive.isEmpty()) {
            // Cancel stale orders older than the most recent one
            Order latest = existingActive.get(0);
            for (int i = 1; i < existingActive.size(); i++) {
                Order stale = existingActive.get(i);
                if (stale.getCreatedAt().isAfter(latest.getCreatedAt())) {
                    latest = stale;
                }
            }
            // Cancel all except the latest active order
            for (Order order : existingActive) {
                if (!order.getId().equals(latest.getId())) {
                    order.setStatus(OrderStatus.CANCELLED);
                    orderRepo.save(order);
                    log.info("Auto-cancelled stale order #{} for user {}", order.getId(), userId);
                }
            }
            log.info("Returning existing active order #{} instead of creating duplicate for user {}", latest.getId(), userId);
            return Optional.of(orderToOrderResponse(latest));
        }

        // ── Fetch cart ───────────────────────────────────────────────────
        CartResponse cartResponse;
        try {
            cartResponse = cartServiceClient.getCartDetails(userId);
        } catch (Exception e) {
            log.error("Failed to fetch cart for user {}: {}", userId, e.getMessage());
            return Optional.empty();
        }
        if (cartResponse == null || cartResponse.getItems() == null || cartResponse.getItems().isEmpty()) {
            return Optional.empty();
        }

        // ── Total price ──────────────────────────────────────────────────
        Long totalAmount = cartResponse.getCartTotal();

        // ── Create Order ─────────────────────────────────────────────────
        Order order = new Order();
        order.setUserId(cartResponse.getUserId());
        order.setStatus(OrderStatus.CREATED);
        order.setTotalAmount(totalAmount);
        List<OrderItem> orderItems = cartResponse.getItems().stream()
                .map(item -> new OrderItem(
                        null,
                        item.getProductId(),
                        item.getSellerId(),
                        item.getQuantity(),
                        item.getPrice(),
                        order
                )).toList();
        order.setItems(orderItems);
        Order savedOrder = orderRepo.save(order);

        // ── Publish saga event ───────────────────────────────────────────
        OrderCreatedEventDto event = new OrderCreatedEventDto(
                savedOrder.getId(),
                savedOrder.getUserId(),
                savedOrder.getTotalAmount(),
                savedOrder.getItems().stream().map(item -> new OrderItemDTO(
                        item.getProductId(),
                        item.getQuantity(),
                        item.getPrice(),
                        item.getPrice() * item.getQuantity()
                )).toList(),
                savedOrder.getCreatedAt()
        );
        streamBridge.send("orderCreated-out-0", event);

        // ── Clear the cart so the user cannot place the same order again ─
        try {
            cartServiceClient.clearCart(userId);
        } catch (Exception e) {
            log.warn("Failed to clear cart for user {} after order #{}: {}", userId, savedOrder.getId(), e.getMessage());
            // Non-fatal: order is already created. Cart will be cleared on next checkout attempt.
        }

        return Optional.of(orderToOrderResponse(savedOrder));
    }

    private OrderResponse orderToOrderResponse(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getItems().stream().map(item -> new OrderItemDTO(
                        item.getProductId(),
                        item.getQuantity(),
                        item.getPrice(),
                        item.getPrice() * item.getQuantity()
                )).toList(),
                order.getCreatedAt()
        );
    }

    public List<OrderResponse> getOrdersForUser(String userId) {
        return orderRepo.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::orderToOrderResponse)
                .toList();
    }

    @Transactional
    public void cancelOrder(OrderCancellationEvent event) {
        Order order = orderRepo.findById(event.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() != OrderStatus.CANCELLED) {
            order.setStatus(OrderStatus.CANCELLED);
        }
    }

    @Transactional
    public void attachPaymentIdToModel(PaymentCreatedEvent event) {
        Order order = orderRepo.findById(event.getOrderId()).orElseThrow();
        order.setPaymentId(event.getPaymentId());
        order.setStatus(OrderStatus.PAYMENT_PENDING);
        orderRepo.save(order);
    }

    public Optional<OrderResponseForPaymentId> getPaymentIdFromOrder(String userId, Long orderId) {
        return orderRepo.findByIdAndUserId(orderId, userId)
                .map(order -> {
                    OrderResponseForPaymentId response = new OrderResponseForPaymentId();
                    response.setOrderStatus(order.getStatus());
                    response.setPaymentId(order.getPaymentId());
                    return response;
                });
    }

    public List<SellerOrderResponse> getOrdersForSeller(String sellerId) {
        return orderRepo.findDistinctByItems_SellerIdOrderByCreatedAtDesc(sellerId).stream()
                .map(order -> orderToSellerOrderResponse(order, sellerId))
                .toList();
    }

    @Transactional
    public Optional<SellerOrderResponse> updateSellerOrderStatus(
            String sellerId,
            Long orderId,
            OrderStatus requestedStatus) {
        if (requestedStatus != OrderStatus.SHIPPED && requestedStatus != OrderStatus.DELIVERED) {
            return Optional.empty();
        }

        return orderRepo.findById(orderId)
                .filter(order -> order.getItems().stream()
                        .anyMatch(item -> sellerId.equals(item.getSellerId())))
                .filter(order -> isValidSellerTransition(order.getStatus(), requestedStatus))
                .map(order -> {
                    order.setStatus(requestedStatus);
                    return orderToSellerOrderResponse(orderRepo.save(order), sellerId);
                });
    }

    private boolean isValidSellerTransition(OrderStatus current, OrderStatus requested) {
        return (current == OrderStatus.CONFIRMED && requested == OrderStatus.SHIPPED)
                || (current == OrderStatus.SHIPPED && requested == OrderStatus.DELIVERED);
    }

    private SellerOrderResponse orderToSellerOrderResponse(Order order, String sellerId) {
        List<SellerOrderItemResponse> sellerItems = order.getItems().stream()
                .filter(item -> sellerId.equals(item.getSellerId()))
                .map(item -> new SellerOrderItemResponse(
                        item.getProductId(),
                        item.getQuantity(),
                        item.getPrice(),
                        item.getPrice() * item.getQuantity()))
                .toList();

        long sellerTotal = sellerItems.stream()
                .map(SellerOrderItemResponse::getTotalPrice)
                .reduce(0L, Long::sum);

        return new SellerOrderResponse(
                order.getId(),
                order.getUserId(),
                order.getStatus(),
                sellerTotal,
                sellerItems,
                order.getCreatedAt());
    }

    @Transactional
    public void handlePaymentSuccess(PaymentSuccessEvent event) {
        Order order = orderRepo.findById(event.getOrderId()).orElseThrow();
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepo.save(order);
    }
}
