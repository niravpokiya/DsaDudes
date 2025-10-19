package com.DsaDude.api_gateway.Config;

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
    public RouteLocator customRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                // Question Service
                .route("Question-service", r -> r.path("/api/question/**")
                        // Keep full path; do NOT strip prefix
                        .uri("http://localhost:8081"))

                // Submission Service
                .route("Submission-service", r -> r.path("/api/submission/**")
                        .uri("http://localhost:8082"))

                // Code Execution Service
                .route("Code-execution-service", r -> r.path("/api/code/**")
                        .uri("http://localhost:8083"))

                // User Service
                .route("User-service", r -> r.path("/api/user/**")
                        .uri("http://localhost:8084"))

                .build();
    }

//    @Bean
//    public CorsWebFilter corsWebFilter() {
//        CorsConfiguration corsConfig = new CorsConfiguration();
//        corsConfig.setAllowedOrigins(Collections.singletonList("http://localhost:5173")); // your frontend
//        corsConfig.addAllowedHeader("*");
//        corsConfig.addAllowedMethod("*");
//        corsConfig.setAllowCredentials(true);
//        corsConfig.setMaxAge(3600L);
//
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        source.registerCorsConfiguration("/**", corsConfig);
//
//        return new CorsWebFilter(source);
//    }
}
