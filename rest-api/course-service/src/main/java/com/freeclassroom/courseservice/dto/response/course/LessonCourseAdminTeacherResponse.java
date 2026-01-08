package com.freeclassroom.courseservice.dto.response.course;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LessonCourseAdminTeacherResponse {
    String id;
    String title;
    String content;
    Long duration;
    String url;
    Long position;
    Boolean isPublic;
}
