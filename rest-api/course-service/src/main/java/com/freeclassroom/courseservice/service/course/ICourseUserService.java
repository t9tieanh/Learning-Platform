package com.freeclassroom.courseservice.service.course;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.PagingResponse;
import com.freeclassroom.courseservice.dto.response.course.CourseUserDetailResponse;
import com.freeclassroom.courseservice.dto.response.course.MyCourseResponse;

public interface ICourseUserService {
    ApiResponse<CourseUserDetailResponse> getCourseDetail(String courseId);
    ApiResponse<PagingResponse<MyCourseResponse>> getCourseUsers(String userId, int page, int size);
}
