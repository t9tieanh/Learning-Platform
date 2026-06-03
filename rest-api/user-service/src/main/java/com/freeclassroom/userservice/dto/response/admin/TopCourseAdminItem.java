package com.freeclassroom.userservice.dto.response.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TopCourseAdminItem {
    String courseId;
    String title;
    String thumbnailUrl;
    long studentCount;
    double rating;
    double revenue;
}
