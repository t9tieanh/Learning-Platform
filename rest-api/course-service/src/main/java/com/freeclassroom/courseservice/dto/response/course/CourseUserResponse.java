package com.freeclassroom.courseservice.dto.response.course;

import com.freeclassroom.courseservice.dto.response.member.EnrollmentResponse;
import com.freeclassroom.courseservice.dto.response.user.InstructorResponse;
import com.freeclassroom.courseservice.enums.entity.EnumCourseProgressStep;
import com.freeclassroom.courseservice.enums.entity.EnumCourseStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
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
    InstructorResponse instructor;

    String category;
    LocalDateTime createdAt;
}
