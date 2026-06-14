package com.DsaDude.api_gateway.Config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {
    // configuring custom routes...
    @Bean
    public RouteLocator customRoutes(
            RouteLocatorBuilder builder
    ) {

        return builder.routes()

                // User Service
                .route("user-service", r -> r
                        .path("/api/user/**")
                        .uri("http://localhost:8084"))

                .route("auth-service", r -> r
                        .path("/api/auth/**")
                        .uri("http://localhost:8084"))

                // Question Service
                .route("question-service", r -> r
                        .path("/api/question/**")
                        .uri("http://localhost:8081"))

                // Submission Service
                .route("submission-service", r -> r
                        .path("/api/submissions/**")
                        .uri("http://localhost:8092"))

                .route("solved-service", r -> r
                        .path("/api/solved/**")
                        .uri("http://localhost:8092"))

                // Code Execution
                .route("execution-service", r -> r
                        .path("/api/code/**")
                        .uri("http://localhost:8092"))

                .build();
    }
}
