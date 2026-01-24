package com.freeclassroom.courseservice.controller.user;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.course.*;
import com.freeclassroom.courseservice.service.course.ICourseService;
import com.freeclassroom.courseservice.service.course.ICourseUserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseUserController {
    ICourseUserService courseUserService;
    ICourseService courseService;

    @GetMapping("/enrolled")
    ApiResponse<List<CourseResponse>> listEnrolledCourses(
            @RequestParam String userRole,
            @RequestParam(required = false) String studentId,
            @RequestParam String instructorId) {
        return courseUserService.getEnrolledCourses(userRole, studentId, instructorId);
    }


    @GetMapping("/{id}")
    ApiResponse<CourseUserDetailResponse> getCouseDetail(@PathVariable("id") String id) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return courseUserService.getCourseDetail(id, userId);
    }

    @GetMapping("/best-seller")
    ApiResponse<List<CourseUserResponse>> getBestSellerCourse(@RequestParam(defaultValue = "4") int limit) {
        return courseUserService.getBestSellerCourse(limit);
    }

    @GetMapping("/trend")
    ApiResponse<List<CourseUserResponse>> getTrendCourse(@RequestParam(defaultValue = "4") int limit) {
        return courseUserService.getTrendyCourse(limit);
    }

    @GetMapping
    ApiResponse<PageResponse<CourseUserResponse>> getAllCourse(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) String sort
    ) {
        return courseUserService.getAllCourses(page, limit, search, category, minPrice, minRating, sort);
    }

    @GetMapping("/count")
    ApiResponse<Integer> countInstructorCourseValid (@RequestParam String instructorId) {
        return courseUserService.countInstructorCourseValid(instructorId);
    }
}
