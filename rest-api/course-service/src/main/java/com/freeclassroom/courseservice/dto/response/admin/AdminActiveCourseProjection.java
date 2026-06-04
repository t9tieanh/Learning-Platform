package com.freeclassroom.courseservice.dto.response.admin;

public interface AdminActiveCourseProjection {
    String getCourseId();
    String getInstructorId();
    String getTitle();
    String getThumbnailUrl();
    Double getRating();
    Long getStudentCount();
}
