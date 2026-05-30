package com.freeclassroom.courseservice.controller.user;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.course.instructor.LearnerAnalyticsResponse;
import com.freeclassroom.courseservice.service.course.ICourseInstructorAnalyticsService;
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
public class CourseInstructorAnalyticsController {
    ICourseInstructorAnalyticsService analyticsService;

    @GetMapping("/learners")
    ApiResponse<LearnerAnalyticsResponse> getLearnerAnalytics(
            @RequestParam String instructorId,
            @RequestParam int year
    ) {
        return analyticsService.getLearnerAnalytics(instructorId, year);
    }
}
