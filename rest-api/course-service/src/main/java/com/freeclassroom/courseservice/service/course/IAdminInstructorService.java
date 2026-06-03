package com.freeclassroom.courseservice.service.course;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.admin.AdminInstructorCoursesPageResponse;
import com.freeclassroom.courseservice.dto.response.admin.AdminInstructorListResponse;
import com.freeclassroom.courseservice.dto.response.admin.AdminInstructorSummaryResponse;

public interface IAdminInstructorService {
    ApiResponse<AdminInstructorListResponse> getAdminInstructors(int page, int limit, String search, String sort, String courseRange);
    ApiResponse<AdminInstructorSummaryResponse> getAdminInstructorSummary(String instructorId, int year);
    ApiResponse<AdminInstructorCoursesPageResponse> getAdminInstructorCourses(String instructorId, int page, int limit);
}
