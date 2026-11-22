package com.ecommerce.gateway.security;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AuthenticatedUserHeaderFilter implements GlobalFilter, Ordered {

    public static final String USER_ID_HEADER = "X-User-ID";
    public static final String USER_NAME_HEADER = "X-User-Name";
    public static final String USER_USERNAME_HEADER = "X-User-Username";
    public static final String USER_EMAIL_HEADER = "X-User-Email";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .filter(JwtAuthenticationToken.class::isInstance)
                .cast(JwtAuthenticationToken.class)
                .map(JwtAuthenticationToken::getToken)
                .flatMap(jwt -> {
                    String userId = jwt.getSubject();
                    String username = jwt.getClaimAsString("preferred_username");
                    String email = jwt.getClaimAsString("email");
                    String givenName = jwt.getClaimAsString("given_name");
                    String familyName = jwt.getClaimAsString("family_name");
                    String fullName = ((givenName != null ? givenName : "") + " " + (familyName != null ? familyName : "")).trim();
                    String displayName = !fullName.isEmpty() ? fullName : (username != null ? username : userId);

                    ServerWebExchange authenticatedExchange = exchange.mutate()
                            .request(request -> request.headers(headers -> {
                                headers.remove(USER_ID_HEADER);
                                headers.set(USER_ID_HEADER, userId);
                                if (displayName != null && !displayName.isBlank()) {
                                    headers.remove(USER_NAME_HEADER);
                                    headers.set(USER_NAME_HEADER, displayName);
                                }
                                if (username != null && !username.isBlank()) {
                                    headers.remove(USER_USERNAME_HEADER);
                                    headers.set(USER_USERNAME_HEADER, username);
                                }
                                if (email != null && !email.isBlank()) {
                                    headers.remove(USER_EMAIL_HEADER);
                                    headers.set(USER_EMAIL_HEADER, email);
                                }
                            }))
                            .build();
                    return chain.filter(authenticatedExchange);
                })
                .switchIfEmpty(Mono.defer(() -> chain.filter(exchange)));
    }

    @Override
    public int getOrder() {
        return 0;
    }
}

