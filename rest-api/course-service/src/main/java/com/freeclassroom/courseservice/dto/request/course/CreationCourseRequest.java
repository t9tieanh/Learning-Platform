package com.freeclassroom.courseservice.dto.request.course;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreationCourseRequest {
    String id;
    String title;
    String shortDescription;
    String longDescription;
    String thumbnailUrl;
    String language;
    List<String> outcomes;
    List<String> requirements;
    String categoryIds;
}
