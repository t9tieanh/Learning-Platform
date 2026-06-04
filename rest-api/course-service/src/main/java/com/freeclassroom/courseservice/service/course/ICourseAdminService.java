package com.freeclassroom.courseservice.service.course;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.CreationResponse;
import com.freeclassroom.courseservice.dto.response.course.CourseListResponse;
import com.freeclassroom.courseservice.dto.response.course.PageResponse;
import com.freeclassroom.courseservice.enums.entity.EnumCourseStatus;

public interface ICourseAdminService {
    ApiResponse<PageResponse<CourseListResponse>> getCourses(int page, int size, String search, EnumCourseStatus status);
    ApiResponse<CreationResponse> approveCourse(String courseId);
    ApiResponse<CreationResponse> rejectCourse(String courseId, String reason);
}
