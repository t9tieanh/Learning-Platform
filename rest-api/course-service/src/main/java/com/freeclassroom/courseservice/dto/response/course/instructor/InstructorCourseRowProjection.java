package com.freeclassroom.courseservice.dto.response.course.instructor;

import java.time.LocalDateTime;

public interface InstructorCourseRowProjection {
    String getId();
    String getTitle();
    String getShortDescription();
    String getThumbnailUrl();
    Double getOriginalPrice();
    Double getFinalPrice();
    Double getRating();
    LocalDateTime getCreatedAt();
    Long getStudentsCount();
}
