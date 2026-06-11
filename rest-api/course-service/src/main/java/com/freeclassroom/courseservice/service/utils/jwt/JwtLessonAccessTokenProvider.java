package com.freeclassroom.courseservice.service.utils.jwt;

import com.freeclassroom.courseservice.configuration.LessonMediaProperties;
import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.exception.ErrorCode;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.Payload;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.text.ParseException;
import java.util.Date;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class JwtLessonAccessTokenProvider {

    public static final String SCOPE_LESSON_VIEW = "LESSON_VIEW";
    public static final String CLAIM_LESSON_ID = "lessonId";
    public static final String CLAIM_OBJECT_KEY = "objectKey";
    public static final String CLAIM_SCOPE = "scope";

    LessonMediaProperties lessonMediaProperties;

    @NonFinal
    @Value("${spring.jwt.signerKey}")
    String signerKey;

    public String generate(String userId, String lessonId, String objectKey) {
        try {
            long ttlMs = lessonMediaProperties.getCookieMaxAgeSeconds() * 1000L;
            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(userId)
                    .claim(CLAIM_LESSON_ID, lessonId)
                    .claim(CLAIM_OBJECT_KEY, objectKey)
                    .claim(CLAIM_SCOPE, SCOPE_LESSON_VIEW)
                    .issueTime(new Date())
                    .expirationTime(new Date(System.currentTimeMillis() + ttlMs))
                    .build();

            JWSObject jwsObject = new JWSObject(
                    new JWSHeader(JWSAlgorithm.HS512),
                    new Payload(claimsSet.toJSONObject())
            );
            jwsObject.sign(new MACSigner(signerKey.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException exception) {
            throw new CustomExeption(ErrorCode.UNAUTHORIZED);
        }
    }

    public JWTClaimsSet verify(String token) {
        try {
            SignedJWT signedJwt = SignedJWT.parse(token);
            if (!signedJwt.verify(new MACVerifier(signerKey.getBytes()))) {
                throw new CustomExeption(ErrorCode.UNAUTHORIZED);
            }

            JWTClaimsSet claims = signedJwt.getJWTClaimsSet();
            Date expiration = claims.getExpirationTime();
            if (expiration == null || expiration.before(new Date())) {
                throw new CustomExeption(ErrorCode.UNAUTHORIZED);
            }

            if (!SCOPE_LESSON_VIEW.equals(claims.getClaim(CLAIM_SCOPE))) {
                throw new CustomExeption(ErrorCode.UNAUTHORIZED);
            }

            return claims;
        } catch (ParseException | JOSEException exception) {
            throw new CustomExeption(ErrorCode.UNAUTHORIZED);
        }
    }

    /** JWT-only gate for nginx auth_request — no DB. Enrollment checked when cookie is issued. */
    public String verifyMediaAccess(String token, String lessonIdFromUri) {
        JWTClaimsSet claims = verify(token);

        String lessonIdFromToken = (String) claims.getClaim(CLAIM_LESSON_ID);
        if (lessonIdFromToken == null || !lessonIdFromToken.equals(lessonIdFromUri)) {
            throw new CustomExeption(ErrorCode.UNAUTHORIZED);
        }

        String objectKey = (String) claims.getClaim(CLAIM_OBJECT_KEY);
        if (objectKey == null || objectKey.isBlank()) {
            throw new CustomExeption(ErrorCode.UNAUTHORIZED);
        }

        return objectKey;
    }
}
