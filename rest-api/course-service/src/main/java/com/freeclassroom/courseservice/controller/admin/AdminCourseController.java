package com.freeclassroom.courseservice.controller.admin;

import com.freeclassroom.courseservice.dto.request.course.RejectCourseRequest;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.CreationResponse;
import com.freeclassroom.courseservice.dto.response.course.CourseListResponse;
import com.freeclassroom.courseservice.dto.response.course.CourseResponse;
import com.freeclassroom.courseservice.dto.response.course.PageResponse;
import com.freeclassroom.courseservice.service.course.ICourseAdminService;
import com.freeclassroom.courseservice.service.course.ICourseService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/courses")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminCourseController {
    ICourseService courseService;
    ICourseAdminService courseAdminService;

    @GetMapping("/{id}")
    public ApiResponse<CourseResponse> getCourse(@PathVariable String id) {
        return courseService.getCourse(id);
    }

    @GetMapping
    public ApiResponse<PageResponse<CourseListResponse>> getCourses(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer limit
    ) {
        return courseAdminService.getCourses(page, limit);
    }

    @PostMapping("/{id}/approve")
    public ApiResponse<CreationResponse> approveCourse(
            @PathVariable String id
    ) {
        return courseAdminService.approveCourse(id);
    }

    @PostMapping("/{id}/reject")
    public ApiResponse<CreationResponse> rejectCourse(
            @PathVariable String id,
            @RequestBody RejectCourseRequest request
    ) {
        return courseAdminService.rejectCourse(id, request.getReason());
    }
}
