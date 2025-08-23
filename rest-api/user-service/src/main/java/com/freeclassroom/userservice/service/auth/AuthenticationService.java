package com.freeclassroom.userservice.service.auth;

import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.enums.role.TokenEnum;
import com.freeclassroom.userservice.dto.request.user.AuthRequest;
import com.freeclassroom.userservice.dto.response.user.AuthResponse;
import com.freeclassroom.userservice.entity.user.UserEntity;
import com.freeclassroom.userservice.enums.entity.EnumAccountStatus;
import com.freeclassroom.userservice.exception.CustomExeption;
import com.freeclassroom.userservice.exception.ErrorCode;
import com.freeclassroom.userservice.repository.entity.UserRepository;
import com.freeclassroom.userservice.repository.httpclient.OutboundAuthenticateClient;
import com.freeclassroom.userservice.repository.httpclient.OutboundUserInfoClient;
import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
public class AuthenticationService implements IAuthenticationService {

    UserRepository userRepository;
    OutboundAuthenticateClient outboundAuthenticateClient;
    OutboundUserInfoClient outboundUserInfoClient;

    PasswordEncoder passwordEncoder;
    JwtService jwtService;

    @NonFinal
    @Value("${outbound.identity.client-id}")
    protected String CLIENT_ID;

    @NonFinal
    @Value("${outbound.identity.client-secret}")
    protected String CLIENT_SECRET ;

    @NonFinal
    @Value("${outbound.identity.redirect-uri}")
    protected String REDIRECT_URL ;


    public ApiResponse<AuthResponse> authentication (AuthRequest request) throws JOSEException {
        UserEntity account = userRepository.findByUsername(request.getUsername()).orElseThrow(
                () -> new CustomExeption(ErrorCode.USER_NOT_FOUND)
        );

        // check status
        if (account.getStatus().equals(EnumAccountStatus.NOT_ACTIVE)) {
            throw new CustomExeption(ErrorCode.USER_BLOCKED);
        }

        boolean result = passwordEncoder.matches(request.getPassword(), account.getPassword());

        if (result) {
            AuthResponse response = AuthResponse.builder()
                    .accessToken(jwtService.generateToken(account, TokenEnum.ACCESS_TOKEN))
                    .refreshToken(jwtService.generateToken(account,TokenEnum.RESFESH_TOKEN))
                    .email(account.getEmail())
                    .username(account.getUsername())
                    .build();

            return ApiResponse.<AuthResponse>builder()
                    .code(200)
                    .message("Xác thực thành công !")
                    .result(response)
                    .build();
        }

        throw new CustomExeption(ErrorCode.UN_AUTHENTICATED);
    }
}
