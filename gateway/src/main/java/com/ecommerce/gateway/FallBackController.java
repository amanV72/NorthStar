package com.ecommerce.gateway;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.time.Instant;

@RestController
@RequestMapping("/fallback")
@Tag(name = "Fallbacks", description = "Circuit-breaker fallback responses")
public class FallBackController {

    private ResponseEntity<ProblemDetail> fallback(String service, String path) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.SERVICE_UNAVAILABLE,
                service + " is temporarily unavailable. Please try again in a moment."
        );
        problem.setTitle("Service Unavailable");
        problem.setInstance(URI.create(path));
        problem.setProperty("timestamp", Instant.now());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(problem);
    }

    @RequestMapping("/products")
    @Operation(summary = "Product-service fallback")
    public ResponseEntity<ProblemDetail> productsFallback() {
        return fallback("Product service", "/fallback/products");
    }

    @RequestMapping("/user")
    @Operation(summary = "User-service fallback")
    public ResponseEntity<ProblemDetail> userFallback() {
        return fallback("User service", "/fallback/user");
    }

    @RequestMapping("/order")
    @Operation(summary = "Order-service fallback")
    public ResponseEntity<ProblemDetail> orderFallback() {
        return fallback("Order service", "/fallback/order");
    }

    @RequestMapping("/cart")
    @Operation(summary = "Cart-service fallback")
    public ResponseEntity<ProblemDetail> cartFallback() {
        return fallback("Cart service", "/fallback/cart");
    }

    @RequestMapping("/inventory")
    @Operation(summary = "Inventory-service fallback")
    public ResponseEntity<ProblemDetail> inventoryFallback() {
        return fallback("Inventory service", "/fallback/inventory");
    }

    @RequestMapping("/payment")
    @Operation(summary = "Payment-service fallback")
    public ResponseEntity<ProblemDetail> paymentFallback() {
        return fallback("Payment service", "/fallback/payment");
    }
}
