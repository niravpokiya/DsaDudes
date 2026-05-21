package com.DsaDude.api_gateway.Auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Component
public class JwtFilter implements GlobalFilter {

    @Autowired
    private JwtUtil jwtUtil;

    private static final Map<String, List<String>> ROLE_ACCESS = Map.of(
            "/api/admin/", List.of("ADMIN"),
            "/api/question/", List.of("USER", "ADMIN"),
            "/api/submissions/", List.of("USER", "ADMIN")
    );

    private static final List<String> PUBLIC_ROUTES = List.of(
            "/api/auth/login",
            "/api/auth/register",
            "/api/code/run"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        // PUBLIC ROUTES
        boolean isPublic = PUBLIC_ROUTES.stream().anyMatch(path::startsWith);
        if (isPublic) {
            return chain.filter(exchange);
        }

        // JWT CHECK
        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String username = jwtUtil.extractUsername(token);
        String role = jwtUtil.extractRole(token);
        boolean routeMatched = false;

        // ROLE AUTHORIZATION
        for (Map.Entry<String, List<String>> entry : ROLE_ACCESS.entrySet()) {
            if (path.startsWith(entry.getKey())) {
                routeMatched = true;
                if (!entry.getValue().contains(role)) {
                    exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
                    return exchange.getResponse().setComplete();
                }
                break;
            }
        }

        // No role config found
        if (!routeMatched) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }

        // Forward headers
        ServerHttpRequest request = exchange.getRequest().mutate()
                .header("X-USER", username)
                .header("X-ROLE", role)
                .header("X-USER-ID", String.valueOf(jwtUtil.extractUserId(token)))
                .build();

        return chain.filter(exchange.mutate().request(request).build());
    }
}