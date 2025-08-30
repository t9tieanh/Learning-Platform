package com.freeclassroom.userservice.service.auth;

import com.freeclassroom.userservice.dto.request.auth.AuthRequest;
import com.freeclassroom.userservice.dto.request.auth.IntrospectRequest;
import com.freeclassroom.userservice.dto.request.auth.LogoutRequest;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.auth.IntrospectResponse;
import com.freeclassroom.userservice.dto.response.user.AuthResponse;
import com.nimbusds.jose.JOSEException;

public interface IAuthenticationService {
    ApiResponse<AuthResponse> authentication (AuthRequest request) throws JOSEException;
    void logout (LogoutRequest request);
    ApiResponse<IntrospectResponse> introspect (IntrospectRequest request);
}
