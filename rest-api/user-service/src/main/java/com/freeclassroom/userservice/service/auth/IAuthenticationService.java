package com.freeclassroom.userservice.service.auth;

import com.freeclassroom.userservice.dto.request.auth.*;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.auth.IntrospectResponse;
import com.freeclassroom.userservice.dto.response.user.AuthResponse;
import com.nimbusds.jose.JOSEException;

import java.text.ParseException;

public interface IAuthenticationService {
    ApiResponse<AuthResponse> authentication (AuthRequest request, Identity identity) throws JOSEException;
    ApiResponse<AuthResponse> oauth2GoogleAuth(String authorizationCode, Identity identity) throws JOSEException;
    void logout (LogoutRequest request);
    ApiResponse<IntrospectResponse> introspect (IntrospectRequest request);
    ApiResponse<AuthResponse> refreshToken(RefreshTokenRequest request) throws JOSEException, ParseException;
}
