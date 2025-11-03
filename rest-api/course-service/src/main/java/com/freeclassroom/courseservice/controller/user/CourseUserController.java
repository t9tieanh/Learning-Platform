package com.freeclassroom.courseservice.controller.user;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.PagingResponse;
import com.freeclassroom.courseservice.dto.response.course.CourseResponse;
import com.freeclassroom.courseservice.dto.response.course.CourseUserDetailResponse;
import com.freeclassroom.courseservice.dto.response.course.MyCourseResponse;
import com.freeclassroom.courseservice.dto.response.course.PageResponse;
import com.freeclassroom.courseservice.service.course.ICourseService;
import com.freeclassroom.courseservice.service.course.ICourseUserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses-user")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseUserController {
    ICourseUserService courseUserService;
    ICourseService courseService;

    @GetMapping("/{id}")
    ApiResponse<CourseUserDetailResponse> getCourseDetail(@PathVariable("id") String id) {
        return courseUserService.getCourseDetail(id);
    }

    @GetMapping("/best-seller")
    ApiResponse<List<CourseResponse>> getBestSellerCourse(@RequestParam(defaultValue = "4") int limit) {
        return courseService.getBestSellerCourse(limit);
    }

    @GetMapping("/trend")
    ApiResponse<List<CourseResponse>> getTrendCourse(@RequestParam(defaultValue = "4") int limit) {
        return courseService.getTrendyCourse(limit);
    }

    @GetMapping
    ApiResponse<PageResponse<CourseResponse>> getAllCourse(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double minRating
    ) {
        return courseService.getAllCourses(page, limit, search, category, minPrice, minRating);
    }

}
