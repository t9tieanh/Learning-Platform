package com.freeclassroom.courseservice.dto.response.course.instructor;

public interface InstructorCourseStatsProjection {
    Long getTotalCourses();
    Double getAverageRating();
}
