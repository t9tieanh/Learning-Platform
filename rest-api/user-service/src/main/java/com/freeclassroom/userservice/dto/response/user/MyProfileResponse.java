package com.freeclassroom.userservice.dto.response.user;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MyProfileResponse {
    String id;
    String image;
    String name;
    String phone;
    String description;
    String position;
    String email;
    String username;

    Set<ExpertiseReponse> expertises;
}
