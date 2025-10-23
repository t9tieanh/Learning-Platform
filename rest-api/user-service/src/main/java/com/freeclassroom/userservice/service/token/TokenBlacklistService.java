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
public class TokenBlacklistService {
    StringRedisTemplate redisTemplate;
    String PREFIX = "blacklist:";

    public void blacklistToken(String jti, Date expiryTime) {
        long ttl = expiryTime.getTime() - System.currentTimeMillis();
        if (ttl > 0) {
            String key = PREFIX + jti;
            redisTemplate.opsForValue().set(PREFIX + jti, "true", ttl, TimeUnit.MILLISECONDS);
            System.out.println("Blacklisted token: " + key + " with TTL: " + ttl + " ms");
        }
    }

    public boolean isTokenBlacklisted(String jti) {
        String key = PREFIX + jti;
        boolean result = Boolean.TRUE.equals(redisTemplate.hasKey(key));
        System.out.println("Check token " + key + " => " + result);
        return result;
//        return Boolean.TRUE.equals(redisTemplate.hasKey(PREFIX + jti));

    }
}
