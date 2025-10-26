package com.freeclassroom.courseservice.service.course;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.course.CourseUserDetailResponse;

public interface ICourseUserService {
    ApiResponse<CourseUserDetailResponse> getCourseDetail(String courseId);
}
