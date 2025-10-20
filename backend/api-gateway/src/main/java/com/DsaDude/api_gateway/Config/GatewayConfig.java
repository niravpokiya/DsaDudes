package com.DsaDude.api_gateway.Config;

import com.DsaDude.api_gateway.Auth.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Collections;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRoutes(RouteLocatorBuilder builder, JwtFilter jwtFilter) {
        return builder.routes()
                // Question Service
                .route("User-service", r -> r.path("/api/user/**").uri("http://localhost:8084"))
                .route("User-service", r -> r.path("/api/auth/**").uri("http://localhost:8084"))
                .route("Question-service", r -> r.path("/api/question/**")
                        .uri("http://localhost:8081"))
                .route("Submission-service", r -> r.path("/api/submission/**")
                        .filters(f -> f.filter(jwtFilter))
                        .uri("http://localhost:8082"))
                .route("Code-execution-service", r -> r.path("/api/code/**")
                        .filters(f -> f.filter(jwtFilter))
                        .uri("http://localhost:8083"))
                .build();
    }
}
