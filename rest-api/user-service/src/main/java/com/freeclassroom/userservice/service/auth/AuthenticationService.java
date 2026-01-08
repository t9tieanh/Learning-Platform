package com.freeclassroom.userservice.service.auth;

import com.freeclassroom.userservice.dto.request.auth.IntrospectRequest;
import com.freeclassroom.userservice.dto.request.auth.LogoutRequest;
import com.freeclassroom.userservice.dto.request.outbound.oauth2.GoogleExchanceTokenRequest;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.auth.IntrospectResponse;
import com.freeclassroom.userservice.dto.response.outbound.oauth2.GoogleGetUserInfo;
import com.freeclassroom.userservice.entity.role.RoleEntity;
import com.freeclassroom.userservice.enums.role.TokenEnum;
import com.freeclassroom.userservice.dto.request.auth.AuthRequest;
import com.freeclassroom.userservice.dto.response.user.AuthResponse;
import com.freeclassroom.userservice.entity.user.UserEntity;
import com.freeclassroom.userservice.enums.entity.EnumAccountStatus;
import com.freeclassroom.userservice.exception.CustomExeption;
import com.freeclassroom.userservice.exception.ErrorCode;
import com.freeclassroom.userservice.repository.entity.UserRepository;
import com.freeclassroom.userservice.repository.httpclient.oauth2.GoogleOutboundAuthenticateClient;
import com.freeclassroom.userservice.repository.httpclient.oauth2.GoogleOutboundUserInfoClient;
import com.freeclassroom.userservice.service.token.TokenBlacklistService;
import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.util.Date;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
@Slf4j
public class AuthenticationService implements IAuthenticationService {

    UserRepository userRepository;

    TokenBlacklistService tokenBlacklistService;

    PasswordEncoder passwordEncoder;
    JwtService jwtService;

    // oauth2
    GoogleOutboundUserInfoClient googleGetUserInfoClient;
    GoogleOutboundAuthenticateClient googleAuthClient;

    @NonFinal
    @Value("${spring.jwt.signerKey}")
    protected String SIGNER_KEY;

    @NonFinal
    @Value("${outbound.identity.client-id}")
    protected String CLIENT_ID;

    @NonFinal
    @Value("${spring.jwt.access-token-expiration}")
    protected long VALID_DURATION;

    @NonFinal
    @Value("${spring.jwt.refresh-token-expiration}")
    protected long REFRESHABLE_DURATION;

    @NonFinal
    @Value("${outbound.identity.client-secret}")
    protected String CLIENT_SECRET;

    @NonFinal
    @Value("${outbound.identity.redirect-uri}")
    protected String REDIRECT_URL;

    // login with username password
    public ApiResponse<AuthResponse> authentication (AuthRequest request) throws JOSEException {
        UserEntity account = userRepository.findFirstByEmailOrUsername(request.getUsername()).orElseThrow(
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
                    .refreshToken(jwtService.generateToken(account,TokenEnum.REFRESH_TOKEN))
                    .email(account.getEmail())
                    .username(account.getUsername())
                    .userId(account.getId())
                    .name(account.getName())
                    .avatarUrl(account.getImage())
                    .role(account.getRoles().stream()
                            .map(RoleEntity::getName)
                            .collect(Collectors.joining(","))
                    )
                    .build();

            return ApiResponse.<AuthResponse>builder()
                    .code(200)
                    .message("Xác thực thành công !")
                    .result(response)
                    .build();
        }

        throw new CustomExeption(ErrorCode.WRONG_USERNAME_PASSWORD);
    }

    public void logout(LogoutRequest request) {
        try {
            var signToken = jwtService.verifyToken(request.getToken(), true);

            String jit = signToken.getJWTClaimsSet().getJWTID();
            Date expirationTime = signToken.getJWTClaimsSet().getExpirationTime();

            tokenBlacklistService.blacklistToken(jit, expirationTime);
        } catch (CustomExeption | ParseException exeption) {
            log.info("Token đã hết hạn");
        } catch (JOSEException e) {
            throw new RuntimeException(e);
        }
    }

    public ApiResponse<IntrospectResponse> introspect(IntrospectRequest request) {
        var token = request.getToken();
        boolean isValid = true;

        try {
            var signToken = jwtService.verifyToken(token, false);
            String jti = signToken.getJWTClaimsSet().getJWTID();

            if (tokenBlacklistService.isTokenBlacklisted(jti)) {
                throw new CustomExeption();
            }
        } catch (CustomExeption | JOSEException | ParseException e) {
            isValid = false;
        }

        IntrospectResponse response = IntrospectResponse.builder().valid(isValid).build();

        return ApiResponse.<IntrospectResponse>builder()
                .code(200)
                .message("Thành công!")
                .result(response)
                .build();
    }

    @Override
    public ApiResponse<AuthResponse> oauth2GoogleAuth(String authorizationCode) throws JOSEException {
        // verify authorization code
        var response = googleAuthClient.exchanceToken(
                GoogleExchanceTokenRequest.builder()
                        .code(authorizationCode)
                        .clientId(CLIENT_ID)
                        .clientSecret(CLIENT_SECRET)
                        .redirectUri(REDIRECT_URL)
                        .grantType("authorization_code")
                        .build()
        );

        // get userinfo after verify authorization code
        GoogleGetUserInfo userInfo = googleGetUserInfoClient.getUserInfo("json", response.getAccessToken());

        // find user in db
        var account =  userRepository.findByEmail(userInfo.getEmail()).orElseGet(
                () -> {
                    return userRepository.save(UserEntity.builder()
                            .email(userInfo.getEmail())
                            .name(userInfo.getName())
                            .username(userInfo.getEmail())
                            .image(userInfo.getPicture())
                            .status(EnumAccountStatus.ACTIVE)
                            .build());
                }
        );

        return ApiResponse.<AuthResponse>builder()
                .code(200)
                .message("Xác thực tài khoản google thành công !")
                .result(AuthResponse.builder()
                        .accessToken(jwtService.generateToken(account, TokenEnum.ACCESS_TOKEN))
                        .refreshToken(jwtService.generateToken(account,TokenEnum.REFRESH_TOKEN))
                        .email(account.getEmail())
                        .username(account.getUsername())
                        .userId(account.getId())
                        .name(account.getName())
                        .avatarUrl(account.getImage())
                        .build())
                .build();
    }
}
