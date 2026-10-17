package com.freeclassroom.courseservice.service.cache;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Slf4j
@Service
public class RedisCacheService {

    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;

    public RedisCacheService(StringRedisTemplate redis) {
        this.redis = redis;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    public <T> T get(String key, Class<T> clazz) {
        String json = readRaw(key);
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(json, clazz);
        } catch (Exception e) {
            log.warn("Redis cache deserialize failed for key='{}' class='{}': {}", key, clazz.getName(), e.getMessage());
            return null;
        }
    }

    public <T> T get(String key, JavaType javaType) {
        String json = readRaw(key);
        if (json == null || json.isBlank()) {
            log.debug("Redis cache MISS key='{}'", key);
            return null;
        }
        try {
            T value = objectMapper.readValue(json, javaType);
            log.debug("Redis cache HIT key='{}'", key);
            return value;
        } catch (Exception e) {
            log.warn("Redis cache deserialize failed for key='{}' type='{}': {}", key, javaType, e.getMessage());
            return null;
        }
    }

    public void set(String key, Object value, Duration ttl) {
        try {
            String json = objectMapper.writeValueAsString(value);
            if (ttl != null) {
                redis.opsForValue().set(key, json, ttl);
                log.debug("Redis cache SET key='{}' ttlSeconds={} bytes={}", key, ttl.toSeconds(), json.length());
            } else {
                redis.opsForValue().set(key, json);
                log.debug("Redis cache SET key='{}' ttlSeconds=null bytes={}", key, json.length());
            }
        } catch (JsonProcessingException e) {
            log.warn("Redis cache serialize failed for key='{}': {}", key, e.getMessage());
        } catch (DataAccessException e) {
            // Cache is best-effort: callers already have the value, so just skip caching.
            log.warn("Redis cache unavailable, skip SET key='{}': {}", key, e.getMessage());
        }
    }

    public JavaType listOf(Class<?> elementClass) {
        return objectMapper.getTypeFactory().constructCollectionType(java.util.List.class, elementClass);
    }

    /**
     * Read the raw cached JSON. Returns null when Redis is unavailable so callers
     * treat it as a cache MISS and fall back to the source of truth (DB / gRPC).
     */
    private String readRaw(String key) {
        try {
            return redis.opsForValue().get(key);
        } catch (DataAccessException e) {
            log.warn("Redis cache unavailable, treat as MISS key='{}': {}", key, e.getMessage());
            return null;
        }
    }
}
