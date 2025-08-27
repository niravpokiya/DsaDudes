package com.DsaDude.api_gateway.Config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("Question-service", r -> r.path("/problem/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://localhost:8081"))
                .route("Submission-service", r -> r.path("/submission/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://localhost:8082"))
                .route("code-execution-service", r -> r.path("/code/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://localhost:8083"))
                .route("user-service", r -> r.path("/user/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://localhost:8084"))
                .build();
    }
}
