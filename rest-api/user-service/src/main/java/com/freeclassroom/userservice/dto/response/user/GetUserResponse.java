package com.freeclassroom.userservice.dto.response.user;

import com.freeclassroom.userservice.enums.entity.EnumAccountStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GetUserResponse {
    String id;
    String name;
    String image;
    String phone;
    String description;
    String position;
    String email;
    String username;
    EnumAccountStatus status;
}
