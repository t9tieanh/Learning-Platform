package com.freeclassroom.userservice.dto.response.course;

import lombok.*;
import lombok.experimental.FieldDefaults;

import static lombok.AccessLevel.PRIVATE;

/**
 * Plain DTO (no protobuf types) to avoid Jackson serialization issues.
 * Aligned with course-service InstructorResponse shape.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = PRIVATE)
public class InstructorResponse {
    String id;
    String name;
    String email;
    String image;
    long totalCourse;
}

