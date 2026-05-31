package com.freeclassroom.courseservice.dto.response.course.instructor;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InstructorPublicInfoResponse {
    String id;
    String name;
    String email;
    String image;
    String description;
}
