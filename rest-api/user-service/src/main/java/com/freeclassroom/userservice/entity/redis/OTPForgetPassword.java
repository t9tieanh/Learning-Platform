package com.freeclassroom.userservice.entity.redis;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

@RedisHash(value = "pending-forget-password", timeToLive = 300)
@AllArgsConstructor
@NoArgsConstructor(force = true)
@Data
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OTPForgetPassword {
    @Id
    String token;
    String email;
    String name;
}
