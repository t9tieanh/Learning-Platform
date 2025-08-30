package com.freeclassroom.userservice.controller;

import com.freeclassroom.userservice.dto.request.auth.AuthRequest;
import com.freeclassroom.userservice.dto.request.auth.IntrospectRequest;
import com.freeclassroom.userservice.dto.request.auth.LogoutRequest;
import com.freeclassroom.userservice.dto.response.*;
import com.freeclassroom.userservice.dto.response.auth.IntrospectResponse;
import com.freeclassroom.userservice.dto.response.user.AuthResponse;
import com.freeclassroom.userservice.service.auth.IAuthenticationService;
import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {

    IAuthenticationService authenticationService;

    @PostMapping
    ApiResponse<AuthResponse> login (@RequestBody AuthRequest request) throws JOSEException {
        return authenticationService.authentication(request);
    }

    @PostMapping("/logout")
    ApiResponse<Void> logout (@RequestBody LogoutRequest request) {
        authenticationService.logout(request);
        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/introspect")
    ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request) {
        return authenticationService.introspect(request);
    }
}
