package com.freeclassroom.gateway.configuration;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.freeclassroom.gateway.dto.ApiResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
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
    private record PublicEndpoint(String pattern, String method) {}

    @NonFinal
    private List<PublicEndpoint> publicEndpoints = List.of(
            new PublicEndpoint("/user.*", "ALL"),
            new PublicEndpoint("/chat-bot.*", "ALL"),
            new PublicEndpoint("/assistant.*", "ALL"),
            new PublicEndpoint("/auth.*", "ALL"),
            new PublicEndpoint("/learning/tags.*", "ALL"),
            new PublicEndpoint("/learning/courses.*", "ALL"),
            new PublicEndpoint("/learning/categories.*", "ALL"),
            new PublicEndpoint("/learning/storage.*", "ALL"),
            new PublicEndpoint("/learning/chapters-user.*", "ALL"),
            new PublicEndpoint("/learning/lesson-student.*", "ALL"),
            new PublicEndpoint("/learning/course-certificates/verify.*", "GET"),
            new PublicEndpoint("/notify/blog.*", "GET"),
            new PublicEndpoint("/sale.*", "ALL"),
            new PublicEndpoint("/notify/ai.*", "ALL"),
            new PublicEndpoint("/socket.io.*", "ALL")
    );

    /** Admin paths stay protected even when a broader public pattern would match. */
    @NonFinal
    private List<PublicEndpoint> protectedAdminEndpoints = List.of(
            new PublicEndpoint("/user/admin/.*", "ALL"),
            new PublicEndpoint("/user/home-admin", "ALL"),
            new PublicEndpoint("/user/ad-certificates", "ALL"),
            new PublicEndpoint("/user/update-certificate", "POST"),
            new PublicEndpoint("/learning/admin/.*", "ALL"),
            new PublicEndpoint("/assistant/admin/.*", "ALL")
    );

    ObjectMapper objectMapper;

    @Value("${app.api-prefix}")
    @NonFinal
    private String apiPrefix;

    private boolean matchesEndpoint(ServerHttpRequest request, PublicEndpoint endpoint) {
        String path = request.getURI().getPath();
        String method = String.valueOf(request.getMethod());

        return path.matches(apiPrefix + endpoint.pattern()) &&
                (endpoint.method().equalsIgnoreCase("ALL") || endpoint.method().equalsIgnoreCase(method));
    }

    private boolean isProtectedAdminEndpoint(ServerHttpRequest request) {
        return protectedAdminEndpoints.stream().anyMatch(e -> matchesEndpoint(request, e));
    }

    private boolean isPublicEndpoint(ServerHttpRequest request) {
        if (isProtectedAdminEndpoint(request)) {
            return false;
        }

        return publicEndpoints.stream().anyMatch(e -> matchesEndpoint(request, e));
    }

    private boolean hasBearerToken(ServerHttpRequest request) {
        List<String> authHeader = request.getHeaders().get(HttpHeaders.AUTHORIZATION);
        if (CollectionUtils.isEmpty(authHeader)) {
            return false;
        }

        String token = authHeader.getFirst().replace("Bearer ", "");
        return !token.isEmpty();
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        if (isPublicEndpoint(exchange.getRequest())) {
            return chain.filter(exchange);
        }

        if (!hasBearerToken(exchange.getRequest())) {
            return unauthenticated(exchange.getResponse());
        }

        return chain.filter(exchange);
    }

    Mono<Void> unauthenticated(ServerHttpResponse response){
        ApiResponse<?> apiResponse = ApiResponse.builder()
                .code(1401)
                .message("Unauthenticated")
                .build();

        String body = null;
        try {
            body = objectMapper.writeValueAsString(apiResponse);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

        return response.writeWith(
                Mono.just(response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8))));
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
