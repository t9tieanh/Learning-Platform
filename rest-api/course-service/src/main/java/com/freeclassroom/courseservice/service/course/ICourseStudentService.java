package com.freeclassroom.courseservice.service.course;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.course.student.CourseDetailResponse;

public interface ICourseStudentService {
    ApiResponse<CourseDetailResponse> getCourseChapter(String courseId, String userId);
    boolean isEnrolledInCourse(String courseId, String userId);
}
