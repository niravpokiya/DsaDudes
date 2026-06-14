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
                        .uri("lb://User-service"))

                .route("auth-service", r -> r
                        .path("/api/auth/**")
                        .uri("lb://User-service"))

                // Question Service
                .route("question-service", r -> r
                        .path("/api/question/**")
                        .uri("lb://question-service"))

                // Submission Service
                .route("submission-service", r -> r
                        .path("/api/submissions/**")
                        .uri("lb://Execution-Submission-Service"))

                .route("solved-service", r -> r
                        .path("/api/solved/**")
                        .uri("lb://Execution-Submission-Service"))

                // Code Execution
                .route("execution-service", r -> r
                        .path("/api/code/**")
                        .uri("lb://Execution-Submission-Service"))

                .build();
    }
}
