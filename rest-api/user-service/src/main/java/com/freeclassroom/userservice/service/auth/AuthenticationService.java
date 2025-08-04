package com.freeclassroom.userservice.service.auth;

import com.freeclassroom.userservice.constant.TokenEnum;
import com.freeclassroom.userservice.dto.request.*;
import com.freeclassroom.userservice.dto.response.*;
import com.freeclassroom.userservice.entity.account.AccountEntity;
import com.freeclassroom.userservice.entity.account.EnumAccountStatus;
import com.freeclassroom.userservice.exception.CustomExeption;
import com.freeclassroom.userservice.exception.ErrorCode;
import com.freeclassroom.userservice.repository.AccountRepository;
import com.freeclassroom.userservice.repository.httpclient.OutboundAuthenticateClient;
import com.freeclassroom.userservice.repository.httpclient.OutboundUserInfoClient;
import com.freeclassroom.userservice.utils.JwtUtils;
import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
public class AuthenticationService {

    AccountRepository accountRepository;
    OutboundAuthenticateClient outboundAuthenticateClient;
    OutboundUserInfoClient outboundUserInfoClient;

    PasswordEncoder passwordEncoder;
    JwtUtils jwtUtils;

    @NonFinal
    @Value("${outbound.identity.client-id}")
    protected String CLIENT_ID;

    @NonFinal
    @Value("${outbound.identity.client-secret}")
    protected String CLIENT_SECRET ;

    @NonFinal
    @Value("${outbound.identity.redirect-uri}")
    protected String REDIRECT_URL ;

    @NonFinal
    protected String GRANT_TYPE = "authorization_code";

    public AuthenticationResponse outBoundAuthentication (String code) throws JOSEException {
        var reponse = outboundAuthenticateClient.exchanceToken(
                ExchanceTokenRequest.builder()
                        .code(code)
                        .clientId(CLIENT_ID)
                        .clientSecret(CLIENT_SECRET)
                        .redirectUri(REDIRECT_URL)
                        .grantType(GRANT_TYPE)
                        .build()
        );

        UserInfoResponse userInfo = outboundUserInfoClient.getUserInfo("json",reponse.getAccessToken());

        var account = accountRepository.findByEmail(userInfo.getEmail()).orElseGet(
                () -> {
                    return accountRepository.save(AccountEntity.builder()
                           .email(userInfo.getEmail())
                           .status(EnumAccountStatus.NOT_ACTIVE)
                           .build());
                }
        );

        return (account.getStatus() != EnumAccountStatus.ACTIVE) ?
                    AuthenticationResponse.builder() // người dùng mới -> chỉ trả về những thông tin để người ta đăng nhập
                    .name(userInfo.getName())
                    .email(userInfo.getEmail())
                    .imageUrl(userInfo.getPicture())
                    .isActive(account.getStatus() == EnumAccountStatus.ACTIVE)
                    .build()

                :

                AuthenticationResponse.builder()
                    .accessToken(jwtUtils.generateToken(account, TokenEnum.ACCESS_TOKEN))
                    .refreshToken(jwtUtils.generateToken(account,TokenEnum.RESFESH_TOKEN))
                    .email(account.getEmail())
                    .username(account.getUsername())
                    .role(account.getRole())
                    .isActive(account.getStatus() == EnumAccountStatus.ACTIVE)
                    .valid(true)
                    .build();
    }

    public AuthenticationResponse authentication (AuthenticationRequest request) throws JOSEException {
        AccountEntity account = accountRepository.findByUsername(request.getUsername()).orElseThrow(
                () -> new CustomExeption(ErrorCode.USER_NOT_FOUND)
        );

        boolean result = passwordEncoder.matches(request.getPassword(), account.getPassword());

        if (result) {
            return AuthenticationResponse.builder()
                    .accessToken(jwtUtils.generateToken(account, TokenEnum.ACCESS_TOKEN))
                    .refreshToken(jwtUtils.generateToken(account,TokenEnum.RESFESH_TOKEN))
                    .email(account.getEmail())
                    .username(account.getUsername())
                    .role(account.getRole())
                    .valid(true)
                    .build();
        }

        throw new CustomExeption(ErrorCode.UN_AUTHENTICATED);
    }

    public ReshfeshTokenResponse reshfeshToken (ReshfeshTokenRequest request) throws ParseException, JOSEException {
        if (!introspectReshfeshToken(request.getRefreshToken())) {
            throw new CustomExeption(ErrorCode.UN_AUTHENTICATED);
        }

        String username = jwtUtils.getUserName(request.getRefreshToken());
        AccountEntity account = accountRepository.findByUsername(username).orElseThrow(
                () -> new CustomExeption(ErrorCode.USER_NOT_FOUND)
        );

        return ReshfeshTokenResponse.builder()
                .refreshToken(jwtUtils.generateToken(account, TokenEnum.RESFESH_TOKEN))
                .accessToken(jwtUtils.generateToken(account, TokenEnum.ACCESS_TOKEN))
                .build();
    }

    public Boolean introspectReshfeshToken (String token) throws JOSEException, ParseException {
        return  jwtUtils.validToken(token, TokenEnum.RESFESH_TOKEN);
    }

    public Boolean introspectAccessToken (String token) throws JOSEException, ParseException {
        return  jwtUtils.validToken(token, TokenEnum.ACCESS_TOKEN);
    }
}
