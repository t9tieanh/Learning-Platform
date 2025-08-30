package com.freeclassroom.gateway.configuration;

//import com.freeclassroom.gateway.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
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
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PACKAGE, makeFinal = true)
public class AuthenticationFilter implements GlobalFilter, Ordered {
//    UserService userService;
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        System.out.println("AuthenticationFilter");

        List<String> authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION);

        if (CollectionUtils.isEmpty(authHeader))
            return noAuthentication(exchange.getResponse());

//        String token = authHeader.getFirst().replace("Bearer ", "");
//
//        userService.introspect(token).subscribe(introspectResponseApiResponse -> {
//            System.out.println(introspectResponseApiResponse.getResult().getValid());
//        });
//
//        List<String> tokens = exchange.getRequest().getHeaders().get("Authorization");
//        if (CollectionUtils.isEmpty(tokens))
//            return noAuthentication(exchange.getResponse());

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
