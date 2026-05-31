package com.freeclassroom.courseservice.dto.response.course.instructor;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InstructorCoursesPageResponse {
    InstructorPublicInfoResponse instructor;
    InstructorCourseStatsResponse stats;
    List<InstructorCourseCardResponse> courses;
    InstructorCoursePaginationResponse pagination;
}
