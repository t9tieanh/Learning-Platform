package com.freeclassroom.userservice.infrastructure.redis;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.connection.stream.ReadOffset;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Component
public class RedisStreamInitializer {
    public static final String EVENT_GUEST = "event:guest";
    public static final String EVENT_USER  = "event:user";
    public static final String GROUP_GUEST = "guest-group";
    public static final String GROUP_USER  = "user-group";
    private final RedisTemplate<String, Object> redisTemplate;

    public RedisStreamInitializer(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void init() {
        createGroup(EVENT_GUEST, GROUP_GUEST);
        createGroup(EVENT_USER, GROUP_USER);
    }

    private void createGroup(String stream, String group) {
        try {
            redisTemplate.opsForStream()
                    .createGroup(stream, ReadOffset.latest(), group);
        } catch (Exception e) {
            if (!e.getMessage().contains("BUSYGROUP")) {
                throw e;
            }
        }
    }
}

