package com.devteria.gateway.configuration;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class AuthenticationFilter implements GlobalFilter, Ordered {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        System.out.println("AuthenticationFilter");

        // get Authorization token
        List<String> tokens = exchange.getRequest().getHeaders().get("Authorization");
        if (CollectionUtils.isEmpty(tokens))
            return noAuthentication(exchange.getResponse());

        return chain.filter(exchange);
    }

    private Mono<Void> noAuthentication(ServerHttpResponse response) {
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        String body = "{\"error\": \"Unauthorized\"}";
        return response.writeWith(Mono.just(response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8))));
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
