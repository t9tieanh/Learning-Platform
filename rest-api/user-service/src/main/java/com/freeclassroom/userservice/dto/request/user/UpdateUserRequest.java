package com.freeclassroom.userservice.dto.request.user;

import com.freeclassroom.userservice.enums.entity.EnumAccountStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateUserRequest {
    String description;
    String email;
    MultipartFile image;
    String name;
    String phone;
    String position;
    EnumAccountStatus status;
}
