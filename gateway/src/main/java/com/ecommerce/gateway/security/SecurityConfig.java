package com.ecommerce.gateway.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Collection;
import java.util.List;
import java.util.Map;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Value("${app.security.client-id:oauth2-pkce}")
    private String clientId;

    @Bean
    public SecurityWebFilterChain securityFilterChain(
            ServerHttpSecurity http,
            CorsConfigurationSource corsConfigurationSource) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .authorizeExchange(authorizeExchangeSpec -> authorizeExchangeSpec
                        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .pathMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html",
                                "/webjars/**", "/actuator/health", "/actuator/info", "/fallback/**")
                        .permitAll()
                        .pathMatchers(HttpMethod.POST, "/api/users", "/api/users/").permitAll()
                        .pathMatchers("/api/products/seller", "/api/products/seller/**").hasRole("SELLER")
                        .pathMatchers("/api/orders/seller", "/api/orders/seller/**").hasRole("SELLER")
                        .pathMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .pathMatchers("/api/cart", "/api/cart/**").hasRole("USER")
                        .pathMatchers(HttpMethod.POST, "/api/orders", "/api/orders/").hasRole("USER")
                        .pathMatchers("/api/orders", "/api/orders/**").hasAnyRole("USER", "ADMIN")
                        .pathMatchers(HttpMethod.GET, "/api/users", "/api/users/").hasRole("ADMIN")
                        .pathMatchers(HttpMethod.GET, "/api/users/*").permitAll()
                        .pathMatchers("/api/users", "/api/users/**").hasAnyRole("USER", "SELLER", "ADMIN")
                        .pathMatchers(HttpMethod.POST, "/api/inventory/*/restock").hasAnyRole("SELLER", "ADMIN")
                        .pathMatchers(HttpMethod.GET, "/api/inventory/**").permitAll()
                        .pathMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
                        .pathMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                        .pathMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")
                        .pathMatchers("/api/payments", "/api/payments/**").hasRole("USER")
                        .anyExchange().authenticated())
                .oauth2ResourceServer(oauth-> oauth.jwt(jwt->jwt.jwtAuthenticationConverter(grantedAuthoritiesExtractor())))
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*"));
        configuration.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }


    private Converter<Jwt, Mono<AbstractAuthenticationToken>> grantedAuthoritiesExtractor(){
        ReactiveJwtAuthenticationConverter jwtAuthenticationConverter= new ReactiveJwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwt->{
            Map<String, Object> resourceAccess = jwt.getClaimAsMap("resource_access");
            if (resourceAccess == null) {
                return Flux.empty();
            }

            Object clientAccess = resourceAccess.get(clientId);
            if (!(clientAccess instanceof Map<?, ?> clientAccessMap)) {
                return Flux.empty();
            }

            Object roles = clientAccessMap.get("roles");
            if (!(roles instanceof Collection<?> roleCollection)) {
                return Flux.empty();
            }

            return Flux.fromIterable(roleCollection)
                    .filter(String.class::isInstance)
                    .cast(String.class)
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role));
        });
        return jwtAuthenticationConverter;
    }
}
