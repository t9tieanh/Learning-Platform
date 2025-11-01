package com.freeclassroom.courseservice.dto.response.course;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InstructorCourseResponse {
    String id;
    String name;
    String image;
    String phone;
    String description;
    String email;
    String username;

    Long numCourse;
    List<ExpertiseResponse> expertise;
}
