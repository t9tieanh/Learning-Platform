package com.freeclassroom.courseservice.controller.user;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.course.instructor.RevenueAnalyticsResponse;
import com.freeclassroom.courseservice.service.course.ICourseInstructorRevenueAnalyticsService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/courses-instructor/analytics")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseInstructorRevenueAnalyticsController {
    ICourseInstructorRevenueAnalyticsService revenueAnalyticsService;

    @GetMapping("/revenue")
    ApiResponse<RevenueAnalyticsResponse> getRevenueAnalytics(
            @RequestParam String instructorId,
            @RequestParam int year
    ) {
        return revenueAnalyticsService.getRevenueAnalytics(instructorId, year);
    }
}
