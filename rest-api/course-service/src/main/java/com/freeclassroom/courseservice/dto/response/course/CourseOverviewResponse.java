package com.freeclassroom.courseservice.dto.response.course;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseOverviewResponse {
    String courseId;
    Long lessonNum;
    Double videoDuration;
    Double finalPrice;
}
