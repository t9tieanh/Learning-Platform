package com.freeclassroom.userservice.dto.response.user;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthResponse {
    String accessToken;
    String refreshToken;
    String userId;
    String name;
    String username;
    String email;
    String userName;
    String avatarUrl;
    String role;
}
