package com.freeclassroom.courseservice.dto.response.admin;

public interface AdminInstructorCourseProjection {
    String getId();
    String getTitle();
    String getCategory();
    String getStatus();
    Double getRating();
    Long getStudentsCount();
}
