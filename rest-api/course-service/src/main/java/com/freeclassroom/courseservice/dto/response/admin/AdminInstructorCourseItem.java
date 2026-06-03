package com.freeclassroom.courseservice.dto.response.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminInstructorCourseItem {
    String id;
    String title;
    String category;
    Long studentsCount;
    Double revenue;
    Double rating;
    String status;
}
