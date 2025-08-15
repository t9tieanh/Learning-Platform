package com.freeclassroom.userservice.controller;

import com.freeclassroom.userservice.dto.request.user.AuthRequest;
import com.freeclassroom.userservice.dto.response.*;
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
    public ApiResponse<AuthResponse> login (@RequestBody AuthRequest request) throws JOSEException {
        return authenticationService.authentication(request);
    }
}
