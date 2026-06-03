package com.freeclassroom.courseservice.dto.response.admin;

public interface AdminInstructorMetricsProjection {
    Long getCourseCount();
    Long getStudentsCount();
    Double getAverageRating();
    Double getCompletionRate();
}
