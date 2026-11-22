package com.ecommerce.cart.controller;


import com.ecommerce.cart.dto.CartItemRequest;
import com.ecommerce.cart.dto.CartResponse;
import com.ecommerce.cart.dto.CartQuantityRequest;
import com.ecommerce.cart.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@Slf4j
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "Manage the authenticated user's cart")
public class CartController {
    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Get the current user's cart")
    public ResponseEntity<CartResponse> getFromCart(@RequestHeader("X-User-ID") String userId) {

        return ResponseEntity.ok(cartService.getCart(userId));

    }

    @PostMapping
    @Operation(summary = "Add an item to the current user's cart")
    public ResponseEntity<String> addToCart(@RequestHeader("X-User-ID") String userId,
                                            @Valid @RequestBody CartItemRequest request) {

        log.info("User ID is : {}",userId);

        boolean isAdded = cartService.addToCart(userId, request);

        if (!isAdded) return ResponseEntity.badRequest().body("Product Out of Stock or User Not Found!");

        return ResponseEntity.status(HttpStatus.CREATED).build();

    }

    @DeleteMapping("/items/{productId}")
    @Operation(summary = "Remove an item from the current user's cart")
    public ResponseEntity<Void> deleteFromCart(@RequestHeader("X-User-ID") String userId,
                                               @PathVariable String productId) {
        boolean isDeleted = cartService.deleteItemFromCart(userId, productId);

        return isDeleted ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();

    }

    @PutMapping("/items/{productId}")
    @Operation(summary = "Update the quantity of an item in the current user's cart")
    public ResponseEntity<Void> updateCartQuantity(
            @RequestHeader("X-User-ID") String userId,
            @PathVariable String productId,
            @Valid @RequestBody CartQuantityRequest request) {
        return cartService.updateQuantity(userId, productId, request.getQuantity())
                ? ResponseEntity.noContent().build()
                : ResponseEntity.badRequest().build();
    }

    @DeleteMapping
    @Operation(summary = "Clear the current user's cart")
    public ResponseEntity<Void> clearCart(@RequestHeader("X-User-ID") String userId) {
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
}
