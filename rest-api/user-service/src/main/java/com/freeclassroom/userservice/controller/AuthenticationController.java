package com.freeclassroom.userservice.controller;

import com.freeclassroom.userservice.dto.request.AuthenticationRequest;
import com.freeclassroom.userservice.dto.request.ReshfeshTokenRequest;
import com.freeclassroom.userservice.dto.request.UserCreationRequest;
import com.freeclassroom.userservice.dto.request.VerifyOtpRequest;
import com.freeclassroom.userservice.dto.response.*;
import com.freeclassroom.userservice.service.account.AccountService;
import com.freeclassroom.userservice.service.auth.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.text.ParseException;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {

    AuthenticationService authenticationService;
    AccountService accountService;

    @PostMapping("outbound/authentication")
    ApiResponse<AuthenticationResponse> outBoundAuthentication(@RequestParam("code") String code) throws JOSEException {
        var result = authenticationService.outBoundAuthentication(code);
        return ApiResponse.<AuthenticationResponse>builder()
                .code(200)
                .result(result)
                .build();
    }

    @PostMapping("outbound/active-account")
    ApiResponse<Boolean> outBoundAuthentication(@ModelAttribute UserCreationRequest request) throws  IOException {
        Boolean result = accountService.ActiveGGAccount(request);

        String message = (result) ? "Account has been created" : "Account has not been created";

        return ApiResponse.<Boolean>builder()
                .code(200)
                .message(message)
                .result(result)
                .build();
    }

    @PostMapping(value="sign-up", consumes = "multipart/form-data")
    public ApiResponse<UserCreationResponse> signUp(@ModelAttribute UserCreationRequest userCreationRequest) throws IOException {

        UserCreationResponse response = accountService.signUp(userCreationRequest);

        return ApiResponse.<UserCreationResponse>builder()
                .code(200)
                .message("Account has been created, please enter the OTP code sent to your email to activate account")
                .result(response)
                .build();
    }

    @PostMapping("verify-otp")
    public ApiResponse<VerifyOtpResponse> verifyOtp(@RequestBody VerifyOtpRequest verifyOtpRequest) throws IOException {

        VerifyOtpResponse response = accountService.verifyOTP(verifyOtpRequest);

        return ApiResponse.<VerifyOtpResponse>builder()
                .code(200)
                .message("Your account has been activated, please log in again")
                .result(response)
                .build();
    }

    @PostMapping("login")
    public ApiResponse<AuthenticationResponse> login (@RequestBody AuthenticationRequest request) throws JOSEException {

        AuthenticationResponse response = authenticationService.authentication(request);
        String message = (response.isValid()) ? "Log in successfully" : "Invalid username or password";

        return ApiResponse.<AuthenticationResponse>builder()
                .code(200)
                .message(message)
                .result(response)
                .build();
    }

    @PostMapping("refresh-token")
    public ApiResponse<ReshfeshTokenResponse> login (@RequestBody ReshfeshTokenRequest request) throws JOSEException, ParseException {

        ReshfeshTokenResponse response = authenticationService.reshfeshToken(request);

        return ApiResponse.<ReshfeshTokenResponse>builder()
                .code(200)
                .result(response)
                .build();
    }

}
