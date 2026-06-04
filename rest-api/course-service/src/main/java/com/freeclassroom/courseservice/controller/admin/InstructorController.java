package com.freeclassroom.courseservice.controller.admin;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.admin.AdminInstructorCoursesPageResponse;
import com.freeclassroom.courseservice.dto.response.admin.AdminInstructorListResponse;
import com.freeclassroom.courseservice.dto.response.admin.AdminInstructorSummaryResponse;
import com.freeclassroom.courseservice.service.course.IAdminInstructorService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/instructors")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InstructorController {
    IAdminInstructorService adminInstructorService;

    @GetMapping
    ApiResponse<AdminInstructorListResponse> getAdminInstructors(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "courses_desc") String sort,
            @RequestParam(required = false) String courseRange
    ) {
        return adminInstructorService.getAdminInstructors(page, limit, search, sort, courseRange);
    }

    @GetMapping("/{instructorId}/summary")
    ApiResponse<AdminInstructorSummaryResponse> getAdminInstructorSummary(
            @PathVariable String instructorId,
            @RequestParam(required = false, defaultValue = "0") int year
    ) {
        return adminInstructorService.getAdminInstructorSummary(instructorId, year);
    }

    @GetMapping("/{instructorId}/courses")
    ApiResponse<AdminInstructorCoursesPageResponse> getAdminInstructorCourses(
            @PathVariable String instructorId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int limit
    ) {
        return adminInstructorService.getAdminInstructorCourses(instructorId, page, limit);
    }
}
