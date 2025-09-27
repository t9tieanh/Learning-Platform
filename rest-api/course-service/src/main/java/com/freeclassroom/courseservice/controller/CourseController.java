package com.freeclassroom.courseservice.controller;

import com.freeclassroom.courseservice.dto.request.course.CreationCourseRequest;
import com.freeclassroom.courseservice.dto.request.course.UpdateTagsRequest;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.CreationResponse;
import com.freeclassroom.courseservice.dto.response.course.CourseResponse;
import com.freeclassroom.courseservice.service.course.ICourseService;
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
public class CourseController {
    ICourseService courseService;

    @GetMapping("/teacher")
    ApiResponse<List<CourseResponse>> getCoursesByTeacherId(@RequestParam String teacherId) {
        return courseService.getCoursesByTeacherId(teacherId);
    }

    @PostMapping
    ApiResponse<CreationResponse> createCourse(@RequestBody CreationCourseRequest request) {
        return courseService.createCourse(request, SecurityContextHolder.getContext().getAuthentication().getName());
    }

    @PutMapping("{id}/tags")
    ApiResponse<CreationResponse> updateTags(
            @PathVariable String id,
            @RequestBody UpdateTagsRequest request
    ) {
        return courseService.updateTags(id, request, SecurityContextHolder.getContext().getAuthentication().getName());
    }
}
