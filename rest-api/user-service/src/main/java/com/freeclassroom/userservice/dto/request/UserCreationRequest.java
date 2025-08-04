package com.freeclassroom.userservice.dto.request;

import com.freeclassroom.userservice.entity.account.EnumAccountStatus;
import com.freeclassroom.userservice.entity.account.EnumRole;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserCreationRequest {
    String email;
    String image;
    String name;
    String phone;

    String username;
    String password;
    String ggId;
    EnumRole role;
    EnumAccountStatus status;

    MultipartFile imageFile;
}
