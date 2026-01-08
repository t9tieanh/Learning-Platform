package com.freeclassroom.userservice.service.instructor;

import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.instructor.ChartDataResponse;
import com.freeclassroom.userservice.dto.response.instructor.InstructorStatisticResponse;

public interface IInstructorService {
    ApiResponse<InstructorStatisticResponse> getInstructorStatistic(String userId);
    ApiResponse<ChartDataResponse> getChartData(int year, String userId);
}
