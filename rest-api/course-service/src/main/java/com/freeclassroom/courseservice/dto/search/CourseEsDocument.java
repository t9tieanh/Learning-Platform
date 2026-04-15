package com.freeclassroom.courseservice.dto.search;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

/**
 * Represents a course document stored in Elasticsearch index (default: courses-dev).
 * Only includes fields needed to build CourseUserResponse.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonIgnoreProperties(ignoreUnknown = true)
public class CourseEsDocument {
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

    String instructorId;
    String category;

    LocalDateTime createdAt;

    // Optional fields if present in index mapping
    String status;
    Boolean deleted;
}

