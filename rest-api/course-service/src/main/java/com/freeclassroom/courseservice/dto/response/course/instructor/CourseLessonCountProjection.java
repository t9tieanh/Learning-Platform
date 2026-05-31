package com.freeclassroom.courseservice.dto.response.course.instructor;

public interface CourseLessonCountProjection {
    String getCourseId();
    Long getLessonsCount();
}
