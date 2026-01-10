package com.freeclassroom.gateway.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Configuration
public class WebClientConfiguration {
    @Bean
    WebClient webClient(){
        return WebClient.builder()
                .baseUrl("http://localhost:8080")
                .build();
    }

    @Bean
    @Order(-1)
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowCredentials(true);
        corsConfig.setAllowedOrigins(List.of("http://localhost:3000", "http://127.0.0.1:3000", "https://qtsmrtrs-3000.asse.devtunnels.ms", "https://learnova.t9tieanh.io.vn"));
        corsConfig.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        corsConfig.setAllowedHeaders(List.of("*"));
        corsConfig.setExposedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
                .cors(cors -> {})          // bật CORS
                .csrf(csrf -> csrf.disable())
                .authorizeExchange(auth -> auth.anyExchange().permitAll())
                .headers(headers -> headers.frameOptions(frame -> frame.disable())); // tắt X-Frame-Options cho iframe

        return http.build();
    }

//    @Bean
//    IdentityClient identityClient(WebClient webClient){
//        HttpServiceProxyFactory httpServiceProxyFactory = HttpServiceProxyFactory
//                .builderFor(WebClientAdapter.create(webClient)).build();
//
//        return httpServiceProxyFactory.createClient(IdentityClient.class);
//    }

}