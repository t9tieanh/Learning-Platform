package com.freeclassroom.userservice.service.token;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RefreshTokenService {
    StringRedisTemplate redisTemplate;
    String PREFIX = "refresh_token:";

    public void saveRefreshToken(String jti, String userId, Date expiryTime) {
        long ttl = expiryTime.getTime() - System.currentTimeMillis();
        if (ttl > 0) {
            redisTemplate.opsForValue().set(PREFIX + jti, userId, ttl, TimeUnit.MILLISECONDS);
        }
    }

    public boolean isValidRefreshToken(String jti) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(PREFIX + jti));
    }

    public void deleteRefreshToken(String jti) {
        redisTemplate.delete(PREFIX + jti);
    }
}
