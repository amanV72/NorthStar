package com.ecommerce.cart.service;

import com.ecommerce.cart.clients.InventoryServiceClient;
import com.ecommerce.cart.clients.ProductServiceClient;
import com.ecommerce.cart.dto.*;
import com.ecommerce.cart.model.CartItem;
import com.ecommerce.cart.repository.CartItemRepo;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {
    private final CartItemRepo cartItemRepo;
    private final ProductServiceClient productServiceClient;
    private final InventoryServiceClient inventoryServiceClient;

    /**
     * Add an item to the cart. This is idempotent for the same (userId, productId):
     * if the item already exists, quantity is incremented by the requested amount.
     * No @Retry — retries at this level caused duplicate cart entries when the
     * gateway circuit-breaker returned 503 but the request had already been processed.
     */
    @Transactional
    public boolean addToCart(String userId, CartItemRequest request) {
        // Look for Product
        ProductResponse productResponse;
        try {
            productResponse = productServiceClient.getProductDetails(String.valueOf(request.getProductId()));
        } catch (Exception e) {
            log.warn("Failed to fetch product {} for user {}: {}", request.getProductId(), userId, e.getMessage());
            return false;
        }
        if (productResponse == null) return false;

        // Check inventory
        Boolean isAvailable;
        try {
            isAvailable = inventoryServiceClient.hasSufficientStock(request.getProductId(), request.getQuantity());
        } catch (Exception e) {
            log.warn("Failed to check inventory for product {}: {}", request.getProductId(), e.getMessage());
            return false;
        }
        if (!Boolean.TRUE.equals(isAvailable)) return false;

        CartItem existingItem = cartItemRepo.findByUserIdAndProductId(userId, request.getProductId());

        long unitPrice = productResponse.getPrice(); // paise

        if (existingItem != null) {
            // Update the quantity
            int newQuantity = existingItem.getQuantity() + request.getQuantity();

            existingItem.setQuantity(newQuantity);
            existingItem.setPrice(unitPrice);
            existingItem.setSellerId(productResponse.getSellerId());
            existingItem.setTotalPrice(unitPrice * newQuantity);

            cartItemRepo.save(existingItem);
        } else {
            // Create a new cart item
            CartItem cartItem = new CartItem();
            cartItem.setUserId(userId);
            cartItem.setProductId(request.getProductId());
            cartItem.setSellerId(productResponse.getSellerId());
            cartItem.setPrice(productResponse.getPrice());
            cartItem.setQuantity(request.getQuantity());
            cartItem.setTotalPrice(unitPrice * request.getQuantity());
            cartItemRepo.save(cartItem);
        }
        return true;
    }

    @Transactional
    public boolean deleteItemFromCart(String userId, String productId) {
        CartItem cartItem = cartItemRepo.findByUserIdAndProductId(userId, productId);

        if (cartItem != null) {
            cartItemRepo.deleteByUserIdAndProductId(userId, productId);
            return true;
        }

        return false;
    }

    @Transactional
    public boolean updateQuantity(String userId, String productId, int quantity) {
        CartItem cartItem = cartItemRepo.findByUserIdAndProductId(userId, productId);
        if (cartItem == null || quantity <= 0) return false;

        Boolean isAvailable;
        try {
            isAvailable = inventoryServiceClient.hasSufficientStock(productId, quantity);
        } catch (Exception e) {
            log.warn("Failed to check inventory for product {}: {}", productId, e.getMessage());
            return false;
        }
        if (!Boolean.TRUE.equals(isAvailable)) return false;

        cartItem.setQuantity(quantity);
        cartItem.setTotalPrice(cartItem.getPrice() * quantity);
        cartItemRepo.save(cartItem);
        return true;
    }

    @Transactional
    public void clearCart(String userId) {
        cartItemRepo.deleteByUserId(userId);
    }

    public CartResponse getCart(String userId) {
        List<CartItem> items = cartItemRepo.findByUserId(userId);

        List<CartItemsResponse> cartItemsResponses = items.stream().map(cartItem -> {
            CartItemsResponse cir = new CartItemsResponse();
            cir.setProductId(cartItem.getProductId());
            cir.setSellerId(cartItem.getSellerId());
            cir.setQuantity(cartItem.getQuantity());
            cir.setPrice(cartItem.getPrice());
            cir.setTotalPrice(cartItem.getTotalPrice());
            return cir;
        }).toList();

        Long cartTotal = items.stream()
                .map(CartItem::getTotalPrice)
                .reduce(0L, Long::sum);

        CartResponse cartResponse = new CartResponse();
        cartResponse.setUserId(userId);
        cartResponse.setItems(cartItemsResponses);
        cartResponse.setCartTotal(cartTotal);

        return cartResponse;
    }
}
