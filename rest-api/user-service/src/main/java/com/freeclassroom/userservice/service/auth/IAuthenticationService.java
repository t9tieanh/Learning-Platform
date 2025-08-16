package com.freeclassroom.userservice.service.auth;

import com.freeclassroom.userservice.dto.request.user.AuthRequest;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.user.AuthResponse;
import com.nimbusds.jose.JOSEException;

public interface IAuthenticationService {
    ApiResponse<AuthResponse> authentication (AuthRequest request) throws JOSEException;
}
