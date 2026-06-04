package com.freeclassroom.courseservice.service.course;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.admin.AdminBusinessPerformanceResponse;

public interface IAdminBusinessPerformanceService {
    ApiResponse<AdminBusinessPerformanceResponse> getBusinessPerformance(String range);
}
