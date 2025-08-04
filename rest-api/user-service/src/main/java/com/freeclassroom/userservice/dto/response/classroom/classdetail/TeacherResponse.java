package com.freeclassroom.userservice.dto.response.classroom.classdetail;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TeacherResponse {
    String email;
    String image;
    String name;
    String phone;
    String description;
    String position;
}
