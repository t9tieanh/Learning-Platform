package com.freeclassroom.courseservice.service.course;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.PagingResponse;
import com.freeclassroom.courseservice.dto.response.course.*;

import java.util.List;

public interface ICourseUserService {
    ApiResponse<CourseUserDetailResponse> getCourseDetail(String courseId, String userId);
    ApiResponse<PagingResponse<MyCourseResponse>> getCourseUsers(String userId, int page, int size);
    ApiResponse<List<CourseUserResponse>> getBestSellerCourse(int limit);
    ApiResponse<List<CourseUserResponse>> getTrendyCourse(int limit);
    ApiResponse<PageResponse<CourseUserResponse>> getAllCourses(int page, int limit, String search, String category,
                                                            Double minPrice, Double minRating, String sort);

    ApiResponse<List<CourseResponse>> getEnrolledCourses(String userRole,String studentId,String instructorId);
    ApiResponse<Integer> countInstructorCourseValid(String instructorId);
}
