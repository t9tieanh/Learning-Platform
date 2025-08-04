package com.freeclassroom.userservice.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.freeclassroom.userservice.entity.account.EnumRole;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthenticationResponse {
    String accessToken;
    String refreshToken;
    String username;
    String email;
    EnumRole role;
    boolean valid;

    // dùng cho gg authentication
    String id;
    boolean verifiedEmail;
    String name;
    String imageUrl;
    boolean isActive;
}
