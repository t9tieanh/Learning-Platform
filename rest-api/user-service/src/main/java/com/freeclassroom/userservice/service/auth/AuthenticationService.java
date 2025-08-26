package com.freeclassroom.userservice.service.auth;

import com.freeclassroom.userservice.dto.request.auth.IntrospectRequest;
import com.freeclassroom.userservice.dto.request.auth.LogoutRequest;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.auth.IntrospectResponse;
import com.freeclassroom.userservice.entity.token.InvalidatedToken;
import com.freeclassroom.userservice.enums.role.TokenEnum;
import com.freeclassroom.userservice.dto.request.auth.AuthRequest;
import com.freeclassroom.userservice.dto.response.user.AuthResponse;
import com.freeclassroom.userservice.entity.user.UserEntity;
import com.freeclassroom.userservice.enums.entity.EnumAccountStatus;
import com.freeclassroom.userservice.exception.CustomExeption;
import com.freeclassroom.userservice.exception.ErrorCode;
import com.freeclassroom.userservice.repository.entity.InvalidatedTokenRepository;
import com.freeclassroom.userservice.repository.entity.UserRepository;
import com.freeclassroom.userservice.repository.httpclient.OutboundAuthenticateClient;
import com.freeclassroom.userservice.repository.httpclient.OutboundUserInfoClient;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
@Slf4j
public class AuthenticationService implements IAuthenticationService {

    UserRepository userRepository;
    InvalidatedTokenRepository invalidatedTokenRepository;

    OutboundAuthenticateClient outboundAuthenticateClient;
    OutboundUserInfoClient outboundUserInfoClient;

    PasswordEncoder passwordEncoder;
    JwtService jwtService;

    @NonFinal
    @Value("${spring.jwt.signerKey}")
    protected String SIGNER_KEY;

    @NonFinal
    @Value("${outbound.identity.client-id}")
    protected String CLIENT_ID;

    @NonFinal
    @Value("${spring.jwt.valid-duration}")
    protected long VALID_DURATION;

    @NonFinal
    @Value("${spring.jwt.refreshable-duration}")
    protected long REFRESHABLE_DURATION;

    @NonFinal
    @Value("${outbound.identity.client-secret}")
    protected String CLIENT_SECRET;

    @NonFinal
    @Value("${outbound.identity.redirect-uri}")
    protected String REDIRECT_URL;


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

        throw new CustomExeption(ErrorCode.UNAUTHENTICATED);
    }

    public void logout(LogoutRequest request) {
        try {
            var signToken = verifyToken(request.getToken(), true);

            String jit = signToken.getJWTClaimsSet().getJWTID();
            Date expirationTime = signToken.getJWTClaimsSet().getExpirationTime();

            InvalidatedToken invalidatedToken =
                    InvalidatedToken.builder()
                            .id(jit)
                            .expiryTime(expirationTime)
                            .build();

            invalidatedTokenRepository.save(invalidatedToken);
        } catch (CustomExeption | ParseException exeption) {
            log.info("Token đã hết hạn");
        } catch (JOSEException e) {
            throw new RuntimeException(e);
        }
    }

    private SignedJWT verifyToken(String token, boolean isRefresh) throws JOSEException, ParseException {
        JWSVerifier jwsVerifier = new MACVerifier(SIGNER_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expirationTime = (isRefresh)
                ? new Date(signedJWT.getJWTClaimsSet().getIssueTime()
                    .toInstant().plus(REFRESHABLE_DURATION, ChronoUnit.SECONDS).toEpochMilli())
                : signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(jwsVerifier);

        if (!(verified && expirationTime.after(new Date())))
            throw new CustomExeption(ErrorCode.UNAUTHENTICATED);

        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID()))
            throw new CustomExeption(ErrorCode.UNAUTHENTICATED);

        return signedJWT;
    }

    public ApiResponse<IntrospectResponse> introspect(IntrospectRequest request) {
        var token = request.getToken();
        boolean isValid = true;

        try {
            verifyToken(token, false);
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
}
