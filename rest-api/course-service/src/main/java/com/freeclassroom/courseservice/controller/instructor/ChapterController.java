package com.freeclassroom.courseservice.controller.instructor;

import com.freeclassroom.courseservice.dto.request.chapter.CreationChapterRequest;
import com.freeclassroom.courseservice.dto.request.chapter.UpdateChapterRequest;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.chapter.ChapterDto;
import com.freeclassroom.courseservice.dto.response.common.CreationResponse;
import com.freeclassroom.courseservice.dto.response.course.ChapterResponse;
import com.freeclassroom.courseservice.service.chapter.IChapterService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chapters")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChapterController {
    IChapterService chapterService;

    @PostMapping
    @PreAuthorize("@courseService.isTeacherOfCourse(#request.courseId, authentication.name)")
    public ApiResponse<CreationResponse> addChapter(@RequestBody CreationChapterRequest request){
        return chapterService.addChapter(request);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("@chapterService.canEditChapter(#id, authentication.name)")
    public ApiResponse<ChapterResponse> updateChapter(@PathVariable String id, @RequestBody UpdateChapterRequest request){
        return chapterService.updateChapter(id, request);
    }

    @GetMapping
    public ApiResponse<List<ChapterDto>> getChapters(
            @RequestParam(required = false) String courseId) {
        if (courseId != null)
            return chapterService.getChaptersByCourseId(courseId);
        return chapterService.getAllChapters();
    }

    @GetMapping("/{id}")
    public ApiResponse<ChapterResponse> getChapterById(@PathVariable String id) {
        return chapterService.findById(id);
    }

    @DeleteMapping("{id}")
    public ApiResponse<CreationResponse> deleteChapterById(@PathVariable String id) {
        return chapterService.deleteChapterById(id);
    }
}
