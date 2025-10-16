package com.freeclassroom.courseservice.controller;

import com.freeclassroom.courseservice.dto.request.common.FileUploadRequest;
import com.freeclassroom.courseservice.dto.request.course.CreationCourseRequest;
import com.freeclassroom.courseservice.dto.request.course.GetCourseRequest;
import com.freeclassroom.courseservice.dto.request.course.InstructorRequest;
import com.freeclassroom.courseservice.dto.request.course.UpdateTagsRequest;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.category.TagResponse;
import com.freeclassroom.courseservice.dto.response.common.CreationResponse;
import com.freeclassroom.courseservice.dto.response.common.FileUploadResponse;
import com.freeclassroom.courseservice.dto.response.course.CourseInfoResponse;
import com.freeclassroom.courseservice.dto.response.course.CourseResponse;
import com.freeclassroom.courseservice.dto.response.course.PageResponse;
import com.freeclassroom.courseservice.service.course.ICourseService;
import com.freeclassroom.courseservice.service.tag.ITagService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseController {
    ICourseService courseService;
    ITagService tagService;

    @GetMapping("/{id}/info")
    ApiResponse<CourseInfoResponse> getCourseInfo(@PathVariable("id") String id) {
        return courseService.getCourseInfo(id);
    }

    @GetMapping("/{id}/tags")
    ApiResponse<List<TagResponse>> getTags(@PathVariable("id") String id) {
        return tagService.getTagsByCourseId(id);
    }

    // GET
    @GetMapping("/details/{id}")
    ApiResponse<CourseResponse> getCourse(@PathVariable String id) {
        return courseService.getCourse(id);
    }

    @PostMapping("/teacher")
    ApiResponse<PageResponse<CourseResponse>> getCoursesByTeacherId(@RequestBody InstructorRequest request) {
        return courseService.getCoursesByTeacherId(request.getInstructorId(), request.getPage(), request.getLimit());
    }

    @PostMapping
    ApiResponse<CreationResponse> createCourse(@RequestBody CreationCourseRequest request) {
        return courseService.createCourse(request, SecurityContextHolder.getContext().getAuthentication().getName());
    }

    @PreAuthorize("@courseService.isTeacherOfCourse(#id, authentication.name)")
    @PatchMapping("{id}/tags")
    ApiResponse<CreationResponse> updateTags(
            @PathVariable String id,
            @RequestBody UpdateTagsRequest request
    ) {
        return courseService.updateTags(id, request, SecurityContextHolder.getContext().getAuthentication().getName());
    }

    @PreAuthorize("@courseService.isTeacherOfCourse(#id, authentication.name)")
    @PatchMapping("{id}/avatar")
    ApiResponse<FileUploadResponse>  updateAvatar(
            @PathVariable("id") String id,
            @ModelAttribute FileUploadRequest request
    ) {
        return courseService.updateAvatar(request, id);
    }
}
