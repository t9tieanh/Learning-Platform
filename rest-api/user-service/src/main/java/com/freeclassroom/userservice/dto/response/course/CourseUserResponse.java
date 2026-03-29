package com.freeclassroom.userservice.dto.response.course;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

import static lombok.AccessLevel.PRIVATE;

/**
 * Response shape aligned with course-service's CourseUserResponse.
 *
 * In user-service we don't always have full course details available locally,
 * so some fields may be null depending on the integration.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = PRIVATE)
public class CourseUserResponse {
    String id;
    String title;
    String shortDescription;
    String longDescription;
    String thumbnailUrl;
    String introductoryVideo;
    String language;
    Double originalPrice;
    Double finalPrice;
    Double rating;

    // Keeping the field for compatibility; user-service may not populate it.
    InstructorResponse instructor;

    String category;
    LocalDateTime createdAt;
}
