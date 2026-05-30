package com.freeclassroom.courseservice.dto.snapshot;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseSnapshot {
    String courseId;
    String title;
    String thumbnailUrl;
    String instructorId;
    String instructorName;
    String instructorAvatarUrl;
}
