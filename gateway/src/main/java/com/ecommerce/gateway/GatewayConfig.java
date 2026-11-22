package com.ecommerce.gateway;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import reactor.core.publisher.Mono;

@Configuration
public class GatewayConfig {
    @Bean
    public RedisRateLimiter redisRateLimiter() {
        return new RedisRateLimiter(
                10,
                20,
                1);
    }

    @Bean
    public KeyResolver userKeyResolver() {
        return exchange ->
                Mono.justOrEmpty(exchange.getRequest()
                                .getHeaders()
                                .getFirst("X-User-ID"))
                        .switchIfEmpty(Mono.just("anonymous"));
    }


    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder routeLocatorBuilder) {
        return routeLocatorBuilder.routes()
                .route("product-service-api-docs", r -> r
                        .path("/v3/api-docs/product-service")
                        .filters(f -> f.setPath("/v3/api-docs"))
                        .uri("lb://PRODUCT-SERVICE"))
                .route("user-service-api-docs", r -> r
                        .path("/v3/api-docs/user-service")
                        .filters(f -> f.setPath("/v3/api-docs"))
                        .uri("lb://USER-SERVICE"))
                .route("order-service-api-docs", r -> r
                        .path("/v3/api-docs/order-service")
                        .filters(f -> f.setPath("/v3/api-docs"))
                        .uri("lb://ORDER-SERVICE"))
                .route("cart-service-api-docs", r -> r
                        .path("/v3/api-docs/cart-service")
                        .filters(f -> f.setPath("/v3/api-docs"))
                        .uri("lb://CART-SERVICE"))
                .route("inventory-service-api-docs", r -> r
                        .path("/v3/api-docs/inventory-service")
                        .filters(f -> f.setPath("/v3/api-docs"))
                        .uri("lb://INVENTORY-SERVICE"))
                .route("payment-service-api-docs", r -> r
                        .path("/v3/api-docs/payment-service")
                        .filters(f -> f.setPath("/v3/api-docs"))
                        .uri("lb://PAYMENT-SERVICE"))
                .route("product-service", r -> r
                        .path("/api/products", "/api/products/**")
                        .filters(f -> f.circuitBreaker(config -> config
                                .setName("productBreaker")
                                .setFallbackUri("forward:/fallback/products")
                        ))
                        .uri("lb://PRODUCT-SERVICE")
                )
                .route("inventory-service", r -> r
                        .path("/api/inventory", "/api/inventory/**")
                        .filters(f -> f.circuitBreaker(config -> config
                                .setName("inventoryBreaker")
                                .setFallbackUri("forward:/fallback/inventory")
                        ))
                        .uri("lb://INVENTORY-SERVICE")
                )
                .route("user-service", r -> r
                        .path("/api/users", "/api/users/**")
                        .filters(f -> f.circuitBreaker(config -> config
                                .setName("userBreaker")
                                .setFallbackUri("forward:/fallback/user")
                        ))
                        .uri("lb://USER-SERVICE")
                )
                .route("payment-service", r -> r
                        .path("/api/payments", "/api/payments/**")
                        .filters(f -> f.circuitBreaker(config -> config
                                .setName("paymentBreaker")
                                .setFallbackUri("forward:/fallback/payment")
                        ))
                        .uri("lb://PAYMENT-SERVICE")
                )
                .route("cart-service", r -> r
                        .path("/api/cart", "/api/cart/**")
                        .filters(f -> f.circuitBreaker(config -> config
                                .setName("cartBreaker")
                                .setFallbackUri("forward:/fallback/cart")
                        ))
                        .uri("lb://CART-SERVICE")
                )
                .route("order-service", r -> r
                        .path("/api/orders", "/api/orders/**")
                        .filters(f -> f.circuitBreaker(config -> config
                                .setName("orderBreaker")
                                .setFallbackUri("forward:/fallback/order")
                        ))
                        .uri("lb://ORDER-SERVICE")
                )
                .route("eureka-server", r -> r
                        .path("/eureka/main")
                        .filters(f -> f.rewritePath(
                                "/eureka/main",
                                "/"))
                        .uri("http://localhost:8761")
                )
                .route("eureka-server-static", r -> r
                        .path("/eureka/**")
                        .uri("http://localhost:8761")
                ).build();
    }
}
