package com.freeclassroom.courseservice.dto.response.course;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseInfoResponse {
    String title;
    String shortDescription;
    String longDescription;
    String thumbnailUrl;
    String language;
    String category;
    Double originalPrice;
    Double finalPrice;
    Set<String> outcomes;
    Set<String> requirements;
}
