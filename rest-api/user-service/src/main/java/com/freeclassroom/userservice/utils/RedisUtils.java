package com.freeclassroom.userservice.utils;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RedisUtils {
    private final RedisTemplate<String, String> redisTemplate;


    @PostConstruct
    public void init() {
        createGroupIfNotExists("event:guest", "guest-group");
        createGroupIfNotExists("event:user", "user-group");
    }

    private void createGroupIfNotExists(String streamKey, String groupName) {
        try {
            redisTemplate.opsForStream().createGroup(streamKey, groupName);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
