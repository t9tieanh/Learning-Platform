package com.freeclassroom.userservice.service.auth;

import com.freeclassroom.userservice.enums.role.TokenEnum;
import com.freeclassroom.userservice.entity.user.UserEntity;
import com.freeclassroom.userservice.exception.CustomExeption;
import com.freeclassroom.userservice.exception.ErrorCode;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    @Value("${spring.jwt.signerKey}")
    private String SIGNER_KEY;

    @NonFinal
    @Value("${spring.jwt.refreshable-duration}")
    protected long REFRESHABLE_DURATION;

    @Value("${spring.jwt.access-token-expiration}")
    private Long accessTokenExpiration;

    @Value("${spring.jwt.refresh-token-expiration}")
    private Long refreshTokenExpiration;


    public String generateToken (UserEntity user, TokenEnum tokenType) throws JOSEException {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        Long date = (tokenType.equals(TokenEnum.ACCESS_TOKEN)) ? accessTokenExpiration : refreshTokenExpiration;

        //payload
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .jwtID(UUID.randomUUID().toString())
                .subject(user.getUsername()) // sub
                .issuer("learningplatform.com") // iss
                .issueTime(new Date()) // iat
                .expirationTime(new Date(System.currentTimeMillis() + date))
                .claim("scope", user.getRoles()) // Custom claim
                .claim("type",tokenType.name())
                .build();

        Payload payload = new Payload(claimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload);

        jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));

        return jwsObject.serialize();
    }

    private JWSVerifier getVerifier() throws JOSEException {
        return new MACVerifier(SIGNER_KEY.getBytes());
    }

    public SignedJWT parseToken(String token) throws ParseException {
        return SignedJWT.parse(token);
    }

    public boolean verifySignature(SignedJWT signedJWT) throws JOSEException {
        return signedJWT.verify(getVerifier());
    }

    public SignedJWT verifyToken(String token, boolean isRefresh) throws JOSEException, ParseException {
        SignedJWT signedJWT = parseToken(token);

        if (!verifySignature(signedJWT) || isExpired(signedJWT, isRefresh)) {
            throw new CustomExeption(ErrorCode.UNAUTHENTICATED);
        }
        return signedJWT;
    }
    public boolean isExpired(SignedJWT signedJWT, boolean isRefresh) throws ParseException {
        Date expirationTime = (isRefresh)
                ? new Date(signedJWT.getJWTClaimsSet().getIssueTime()
                .toInstant().plus(REFRESHABLE_DURATION, ChronoUnit.SECONDS).toEpochMilli())
                : signedJWT.getJWTClaimsSet().getExpirationTime();

        return expirationTime.before(new Date());
    }



    public Boolean validToken (String token, TokenEnum tokenType) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);
        Date expirationDate = signedJWT.getJWTClaimsSet().getExpirationTime();
        TokenEnum tokenTypeEnum = TokenEnum.valueOf(signedJWT.getJWTClaimsSet().getClaim("type").toString());
//        String jwtId = signedJWT.getJWTClaimsSet().getJWTID();

//        String tokenvalue = tokenTypeEnum.getValue();
//        String tmp = tokenType.getValue();
        boolean flag = tokenTypeEnum.getValue().equals(tokenType.getValue());

        if (!(expirationDate.after(new Date()))
                || !signedJWT.verify(verifier) || !flag)
            return false;

        return true;
    }
}
