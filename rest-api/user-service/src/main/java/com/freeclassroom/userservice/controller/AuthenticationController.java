package com.freeclassroom.userservice.controller;

import com.freeclassroom.userservice.dto.request.auth.*;
import com.freeclassroom.userservice.dto.request.common.EmailRequest;
import com.freeclassroom.userservice.dto.response.*;
import com.freeclassroom.userservice.dto.response.auth.CheckForgotPasswordResponse;
import com.freeclassroom.userservice.dto.response.auth.IntrospectResponse;
import com.freeclassroom.userservice.dto.response.user.AuthResponse;
import com.freeclassroom.userservice.dto.response.user.UserResponse;
import com.freeclassroom.userservice.service.auth.IAuthenticationService;
import com.freeclassroom.userservice.service.user.IUserService;
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
    IUserService userService;

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

    @PostMapping("oauth2/google")
    ApiResponse<AuthResponse> outBoundAuthentication(@RequestParam("code") String code) throws JOSEException {
        return authenticationService.oauth2GoogleAuth(code);
    }

    @PostMapping("forgot-password")
    ApiResponse<Void> forgotPassword(@RequestBody EmailRequest request) {
        return userService.forgotPassword(request.getEmail());
    }

    @GetMapping("forgot-password/{code}")
    public ApiResponse<CheckForgotPasswordResponse> checkForgotPassword(@PathVariable String code) {
        return userService.checkForgotPassword(code);
    }


    @PostMapping("reset-password")
    ApiResponse<UserResponse> resetPassword(@RequestBody ResetPasswordRequest request) {
        return userService.verifyForgotPassword(request.getCode(), request.getNewPassword());
    }
}
