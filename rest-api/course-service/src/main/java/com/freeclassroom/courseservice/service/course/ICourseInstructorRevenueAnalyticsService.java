package com.freeclassroom.courseservice.service.course;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.course.instructor.RevenueAnalyticsResponse;

public interface ICourseInstructorRevenueAnalyticsService {
    ApiResponse<RevenueAnalyticsResponse> getRevenueAnalytics(String instructorId, int year);
}
