package com.freeclassroom.courseservice.dto.response.course.student;
import com.freeclassroom.courseservice.dto.response.user.InstructorResponse;
import com.freeclassroom.courseservice.enums.entity.EnumCourseStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseDetailResponse {
    String id;
    String title;
    String shortDescription;
    String longDescription;
    String thumbnailUrl;
    String language;
    Double rating;

    EnumCourseStatus status;
    InstructorResponse instructor;

    List<ChapterResponse> chapters;
}
