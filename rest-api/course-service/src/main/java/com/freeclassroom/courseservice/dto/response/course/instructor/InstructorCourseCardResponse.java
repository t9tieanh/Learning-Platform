package com.freeclassroom.courseservice.dto.response.course.instructor;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InstructorCourseCardResponse {
    String id;
    String title;
    String shortDescription;
    String thumbnailUrl;
    Double originalPrice;
    Double finalPrice;
    Double rating;
    Long studentsCount;
    Long lessonsCount;
    LocalDateTime createdAt;
    Boolean isBestSeller;
}
