//package com.freeclassroom.gateway.service;
//
//import com.freeclassroom.gateway.dto.ApiResponse;
//import com.freeclassroom.gateway.dto.request.IntrospectRequest;
//import com.freeclassroom.gateway.dto.response.IntrospectResponse;
//import com.freeclassroom.gateway.repository.UserClient;
//import lombok.AccessLevel;
//import lombok.RequiredArgsConstructor;
//import lombok.experimental.FieldDefaults;
//import org.springframework.stereotype.Service;
//import reactor.core.publisher.Mono;
//
//@Service
//@RequiredArgsConstructor
//@FieldDefaults(level = AccessLevel.PACKAGE, makeFinal = true)
//public class UserService {
//    UserClient userClient;
//    public Mono<ApiResponse<IntrospectResponse>> introspect(String token) {
//        return userClient.introspect(IntrospectRequest.builder().token(token).build());
//    }
//}
