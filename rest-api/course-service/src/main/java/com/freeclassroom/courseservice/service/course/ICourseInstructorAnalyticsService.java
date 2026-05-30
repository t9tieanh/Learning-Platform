package com.freeclassroom.courseservice.service.course;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.course.instructor.LearnerAnalyticsResponse;

public interface ICourseInstructorAnalyticsService {
    ApiResponse<LearnerAnalyticsResponse> getLearnerAnalytics(String instructorId, int year);
}
