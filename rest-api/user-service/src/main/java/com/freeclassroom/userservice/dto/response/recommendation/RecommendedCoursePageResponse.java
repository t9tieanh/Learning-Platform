package com.freeclassroom.userservice.dto.response.recommendation;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

import static lombok.AccessLevel.PRIVATE;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = PRIVATE)
public class RecommendedCoursePageResponse {
    List<RecommendedCourseItem> items;
    String nextCursor;
}

