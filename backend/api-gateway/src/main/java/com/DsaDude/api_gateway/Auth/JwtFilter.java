package com.DsaDude.api_gateway.Auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Comparator;
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
            "/api/code/run",
            "/api/question/all-published"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange,
                             GatewayFilterChain chain) {

        String path = exchange.getRequest().getURI().getPath();

        // Allow preflight CORS requests
        if (exchange.getRequest().getMethod().name().equals("OPTIONS")) {
            return chain.filter(exchange);
        }

        // PUBLIC ROUTES
        boolean isPublic = PUBLIC_ROUTES.stream()
                .anyMatch(path::startsWith);

        if (isPublic) {
            return chain.filter(exchange);
        }

        // JWT CHECK
        String authHeader = exchange.getRequest()
                .getHeaders()
                .getFirst("Authorization");

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {
            exchange.getResponse()
                    .setStatusCode(HttpStatus.UNAUTHORIZED);

            return exchange.getResponse().setComplete();
        }

        String token = authHeader.substring(7);

        System.out.println("TOKEN EXTRACTED");

        boolean valid = jwtUtil.validateToken(token);

        System.out.println("TOKEN VALID = " + valid);

        if (!valid) {
            System.out.println("JWT FAILED");
            exchange.getResponse()
                    .setStatusCode(HttpStatus.UNAUTHORIZED);

            return exchange.getResponse().setComplete();
        }

        System.out.println("JWT PASSED");

        String username =
                jwtUtil.extractUsername(token);

        String role =
                jwtUtil.extractRole(token);

        // ROLE based AUTHORIZATION
        String matchedPath = ROLE_ACCESS
                .keySet()
                .stream()
                .filter(path::startsWith)
                .max(Comparator.comparingInt(
                        String::length
                ))
                .orElse(null);

        if (matchedPath != null) {
            List<String> allowedRoles = ROLE_ACCESS.get(matchedPath);
            if (!allowedRoles.contains(role)) {
                exchange.getResponse()
                        .setStatusCode(
                                HttpStatus.FORBIDDEN
                        );
                return exchange
                        .getResponse()
                        .setComplete();
            }
        }

        ServerHttpRequest request = exchange.getRequest().mutate()
                        .header("X-USER", username)
                        .header("X-ROLE", role)
                        .header("X-USER-ID",
                                String.valueOf(
                                        jwtUtil.extractUserId(token)
                                ))
                        .build();

        return chain.filter(
                exchange.mutate()
                        .request(request)
                        .build()
        );
    }
}