package com.freeclassroom.courseservice.controller.instructor;

import com.freeclassroom.courseservice.dto.request.common.FileUploadRequest;
import com.freeclassroom.courseservice.dto.request.course.CreationCourseRequest;
import com.freeclassroom.courseservice.dto.request.course.InstructorRequest;
import com.freeclassroom.courseservice.dto.request.course.UpdatePriceRequest;
import com.freeclassroom.courseservice.dto.request.course.UpdateTagsRequest;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.category.TagResponse;
import com.freeclassroom.courseservice.dto.response.common.CreationResponse;
import com.freeclassroom.courseservice.dto.response.common.FileUploadResponse;
import com.freeclassroom.courseservice.dto.response.course.*;
import com.freeclassroom.courseservice.service.course.ICourseService;
import com.freeclassroom.courseservice.service.tag.ITagService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("instructor/courses")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseController {
    ICourseService courseService;
    ITagService tagService;

    @GetMapping("/{id}/info")
    @PreAuthorize("@courseService.isTeacherOfCourse(#id, authentication.name)")
    ApiResponse<CourseInfoResponse> getCourseInfo(@PathVariable("id") String id) {
        return courseService.getCourseInfo(id);
    }

    @GetMapping("/{id}/tags")
    ApiResponse<List<TagResponse>> getTags(@PathVariable("id") String id) {
        return tagService.getTagsByCourseId(id);
    }

    @GetMapping("/details/{id}")
    @PreAuthorize("@courseService.isTeacherOfCourse(#id, authentication.name)")
    ApiResponse<CourseResponse> getCourse(@PathVariable String id) {
        return courseService.getCourse(id);
    }

    @PostMapping("/")
    ApiResponse<PageResponse<CourseResponse>> getCoursesByTeacherId(@RequestBody InstructorRequest request) {
        return courseService.getCoursesByTeacherId(request.getInstructorId(), request.getPage(), request.getLimit(), request.getIsPublic());
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

    @PreAuthorize("@courseService.isTeacherOfCourse(#id, authentication.name)")
    @PatchMapping("{id}/price")
    ApiResponse<CreationResponse> updatePrice(
            @PathVariable("id") String id,
            @RequestBody UpdatePriceRequest newPrice
    ) {
        return courseService.updatePrice(newPrice, id);
    }

    @PreAuthorize("@courseService.isTeacherOfCourse(#id, authentication.name)")
    @GetMapping("{id}/price")
    ApiResponse<PriceCourseResponse> getPrice(
            @PathVariable("id") String id
    ) {
        return courseService.getPrice(id);
    }

    @PreAuthorize("@courseService.isTeacherOfCourse(#id, authentication.name)")
    @GetMapping("{id}/overview")
    ApiResponse<CourseOverviewResponse> getCourseOverview(
            @PathVariable("id") String id
    ) {
        return courseService.getOverview(id);
    }

    @PreAuthorize("@courseService.isTeacherOfCourse(#id, authentication.name)")
    @PostMapping("{id}/video-introduction")
    Flux<ServerSentEvent<String>> updateVideoIntro(@RequestPart(value = "file") MultipartFile video,
        @PathVariable("id") String id
    ) throws IOException {
        return courseService.updateVideoIntroduce(video, id);
    }

    @PreAuthorize("@courseService.isTeacherOfCourse(#id, authentication.name)")
    @PostMapping("{id}/request-approval")
    ApiResponse<CreationResponse> requestApproval(@PathVariable("id") String id) {
        return courseService.requestApproval(id);
    }

    @PreAuthorize("@courseService.isTeacherOfCourse(#id, authentication.name)")
    @DeleteMapping("{id}")
    ApiResponse<CreationResponse> delCourse(@PathVariable("id") String id) {
        return courseService.delCourse(id);
    }
}
