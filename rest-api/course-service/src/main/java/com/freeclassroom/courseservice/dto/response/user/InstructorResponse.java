package com.freeclassroom.courseservice.dto.response.user;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InstructorResponse {
    String id;
    String name;
    String email;
    String image;
    long totalCourse;
}
