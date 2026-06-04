package com.freeclassroom.courseservice.dto.response.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminInstructorCoursesPageResponse {
    List<AdminInstructorCourseItem> items;
    int page;
    int limit;
    long totalItems;
    int totalPages;
    boolean hasNext;
}
