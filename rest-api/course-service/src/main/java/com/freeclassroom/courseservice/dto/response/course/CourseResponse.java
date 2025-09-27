package com.freeclassroom.courseservice.dto.response.course;

import com.freeclassroom.courseservice.enums.entity.EnumCourseProgressStep;
import com.freeclassroom.courseservice.enums.entity.EnumCourseStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseResponse {
    String id;
    String title;
    String shortDescription;
    String longDescription;
    String thumbnailUrl;
    String language;
    Double originalPrice;
    Double finalPrice;

    EnumCourseStatus status;
    String instructorId;

    List<String> chapterIds;
    List<String> enrollmentIds;
    List<String> tagNames;

    String categoryName;

    EnumCourseProgressStep progressStep;

    Set<String> outcomes;
    Set<String> requirements;
}
