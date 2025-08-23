package com.freeclassroom.userservice.dto.request.user;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreationUserRequest {
    String name;
    String phone;
    String username;
    String password;

    String email;
}
