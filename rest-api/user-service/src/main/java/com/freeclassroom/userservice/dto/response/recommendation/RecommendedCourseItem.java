package com.freeclassroom.userservice.dto.response.recommendation;

import lombok.*;
import lombok.experimental.FieldDefaults;

import static lombok.AccessLevel.PRIVATE;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = PRIVATE)
public class RecommendedCourseItem {
    String courseId;
    double score;
    String reason;
}

