package com.freeclassroom.userservice.infrastructure.redis;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.connection.stream.ReadOffset;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

import static com.freeclassroom.userservice.enums.RedisStreamEnum.*;

@Component
@RequiredArgsConstructor
public class RedisStreamGroupInitializer {

    private final StringRedisTemplate redis;

    @PostConstruct
    public void ensureGroups() {
        ensureGroup(EVENT_USER.getValue(), GROUP_USER.getValue());
        ensureGroup(EVENT_GUEST.getValue(), GROUP_GUEST.getValue());
    }

    private void ensureGroup(String stream, String group) {
        try {
            redis.opsForStream().createGroup(stream, ReadOffset.from("0-0"), group);
            return;
        } catch (Exception e) {
            // BUSYGROUP means group already exists => ignore
            String msg = e.getMessage();
            if (msg != null && msg.contains("BUSYGROUP")) return;
        }

        // If stream doesn't exist, create it then retry (best-effort).
        try {
            redis.opsForStream().add(stream, java.util.Map.of("_init", "1"));
            redis.opsForStream().createGroup(stream, ReadOffset.from("0-0"), group);
        } catch (Exception ignored) {
        }
    }
}
