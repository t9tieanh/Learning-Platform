package com.freeclassroom.userservice.controller;

import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.instructor.ChartDataResponse;
import com.freeclassroom.userservice.dto.response.instructor.InstructorStatisticResponse;
import com.freeclassroom.userservice.service.instructor.IInstructorService;
import com.freeclassroom.userservice.service.user.IUserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/instructor")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InstructorController {
    IUserService userService;
    IInstructorService instructorService;
    @GetMapping("/statistic")
    ApiResponse<InstructorStatisticResponse> getInstructorStatistic(
            @RequestParam String userId
    ) {
        return instructorService.getInstructorStatistic(userId);
    }

    @GetMapping("/chart")
    ApiResponse<ChartDataResponse> getChartData (
            @RequestParam int year,
            @RequestParam String userId
    ) {
        return instructorService.getChartData(year, userId);
    }

}
