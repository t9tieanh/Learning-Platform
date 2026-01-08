package com.freeclassroom.courseservice.controller.instructor;

import com.freeclassroom.courseservice.dto.request.lesson.CreationDocumentRequest;
import com.freeclassroom.courseservice.dto.request.lesson.CreationVideoRequest;
import com.freeclassroom.courseservice.dto.request.lesson.UpdateLessonRequest;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.CreationResponse;
import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.exception.ErrorCode;
import com.freeclassroom.courseservice.service.lesson.ILessonService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;

import java.io.IOException;

@RestController
@RequestMapping("/lessons")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LessonController {
    ILessonService lessonService;

    @PostMapping("/video")
    @PreAuthorize("@chapterService.canEditChapter(#lesson.chapterId, authentication.name)")
    Flux<ServerSentEvent<String>> addVideoWithProgress(@RequestPart(value = "file") MultipartFile video,
                                                       @RequestPart(value = "lesson")CreationVideoRequest lesson) throws IOException {
        if(video.isEmpty()){
            throw new CustomExeption(ErrorCode.FILE_NOT_FOUND);
        }
        lesson.setFile(video);
        return lessonService.addVideoWithProgress(lesson);
    }

    @PostMapping("/article")
    @PreAuthorize("@chapterService.canEditChapter(#lesson.chapterId, authentication.name)")
    Flux<ServerSentEvent<String>> addDocumentWithProgress(@RequestPart(value = "file") MultipartFile file,
                                                       @RequestPart(value = "lesson") CreationDocumentRequest lesson) throws IOException {
        lesson.setFile(file);
        return lessonService.addDocumentWithProgress(lesson);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@lessonService.canEditLesson(#id, authentication.name)")
    ApiResponse<CreationResponse> addDocumentWithProgress(@PathVariable("id") String id) {
        return lessonService.deleteLesson(id);
    }

    @PatchMapping("/{id}/name")
    @PreAuthorize("@lessonService.canEditLesson(#id, authentication.name)")
    ApiResponse<CreationResponse> updateNameOfLesson(@PathVariable("id") String id, @RequestBody UpdateLessonRequest request) {
        return lessonService.updateNameOfLesson(id, request.getTitle());
    }

    @PatchMapping("/{id}")
    @PreAuthorize("@lessonService.canEditLesson(#id, authentication.name)")
    ApiResponse<CreationResponse> updateMetaLesson(@PathVariable("id") String id, @RequestBody UpdateLessonRequest request) {
        return lessonService.updateMetaLesson(id, request);
    }
}
