package com.freeclassroom.userservice.entity.redis;

import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.springframework.data.redis.core.RedisHash;

@RedisHash(value = "refeshTokenBlackList", timeToLive = 300)
@AllArgsConstructor
@NoArgsConstructor(force = true)
@Data
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RefeshTokenBlackList {
    @Id
    String token;
}
