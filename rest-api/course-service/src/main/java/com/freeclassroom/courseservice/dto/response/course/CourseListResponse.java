package com.freeclassroom.courseservice.dto.response.course;

import com.freeclassroom.courseservice.dto.response.user.InstructorResponse;
import com.freeclassroom.courseservice.enums.entity.EnumCourseProgressStep;
import com.freeclassroom.courseservice.enums.entity.EnumCourseStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseListResponse {
    String id;
    String title;
    String shortDescription;
    String longDescription;
    String thumbnailUrl;
    String language;
    Double originalPrice;
    Double finalPrice;
    Double rating;
    String instructorId;

    EnumCourseStatus status;
    InstructorResponse instructor;
    EnumCourseProgressStep progressStep;
}
