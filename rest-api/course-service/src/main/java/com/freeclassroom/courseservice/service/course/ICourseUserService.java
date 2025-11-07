package com.freeclassroom.courseservice.service.course;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.PagingResponse;
import com.freeclassroom.courseservice.dto.response.course.CourseResponse;
import com.freeclassroom.courseservice.dto.response.course.CourseUserDetailResponse;
import com.freeclassroom.courseservice.dto.response.course.MyCourseResponse;
import com.freeclassroom.courseservice.dto.response.course.PageResponse;

import java.util.List;

public interface ICourseUserService {
    ApiResponse<CourseUserDetailResponse> getCourseDetail(String courseId);
    ApiResponse<PagingResponse<MyCourseResponse>> getCourseUsers(String userId, int page, int size);
    ApiResponse<List<CourseResponse>> getBestSellerCourse(int limit);
    ApiResponse<List<CourseResponse>> getTrendyCourse(int limit);
    ApiResponse<PageResponse<CourseResponse>> getAllCourses(int page, int limit, String search, String category,
                                                            Double minPrice, Double minRating);

    ApiResponse<List<CourseResponse>> getEnrolledCourses(String userRole,String studentId,String instructorId);
}
