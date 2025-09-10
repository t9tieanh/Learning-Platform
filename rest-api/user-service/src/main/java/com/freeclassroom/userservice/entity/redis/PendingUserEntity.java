package com.freeclassroom.userservice.entity.redis;

import com.freeclassroom.userservice.enums.entity.EnumAccountStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import java.io.Serializable;

@RedisHash(value = "pending-user", timeToLive = 300)
@AllArgsConstructor
@NoArgsConstructor(force = true)
@Data
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PendingUserEntity implements Serializable {
    @Id
    String token; // UUID random
    String email;
    String name;
    String phone;
    String username;
    String password;
    EnumAccountStatus status;
}
