package com.freeclassroom.courseservice.controller.instructor;

import com.freeclassroom.courseservice.dto.request.lesson.ChunkCompleteRequest;
import com.freeclassroom.courseservice.dto.request.lesson.ChunkPresignRequest;
import com.freeclassroom.courseservice.dto.request.lesson.ChunkedUploadInitRequest;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.lesson.ChunkPresignResponse;
import com.freeclassroom.courseservice.dto.response.lesson.ChunkedUploadInitResponse;
import com.freeclassroom.courseservice.dto.response.lesson.LessonDto;
import com.freeclassroom.courseservice.dto.response.lesson.LessonUploadSessionResponse;
import com.freeclassroom.courseservice.service.lesson.ILessonUploadService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/lessons/video/v2")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LessonUploadController {
    ILessonUploadService lessonUploadService;

    @PostMapping("/sessions")
    @PreAuthorize("@chapterService.canEditChapter(#request.chapterId, authentication.name)")
    ApiResponse<ChunkedUploadInitResponse> initUpload(@Valid @RequestBody ChunkedUploadInitRequest request,
                                         Authentication authentication) {
        ChunkedUploadInitResponse response = lessonUploadService.initUpload(request, authentication.getName());
        return ApiResponse.<ChunkedUploadInitResponse>builder()
                .message("Khởi tạo phiên upload thành công")
                .result(response)
                .build();
    }

    @PostMapping("/sessions/{sessionId}/presign")
    ApiResponse<ChunkPresignResponse> presignParts(@PathVariable String sessionId,
                                      @Valid @RequestBody ChunkPresignRequest request,
                                      Authentication authentication) {
        ChunkPresignResponse response = lessonUploadService.generatePresignedUrls(sessionId, request, authentication.getName());
        return ApiResponse.<ChunkPresignResponse>builder()
                .message("Lấy presigned URLs thành công")
                .result(response)
                .build();
    }

    @PostMapping("/sessions/{sessionId}/complete")
    ApiResponse<LessonDto> completeUpload(@PathVariable String sessionId,
                                          @Valid @RequestBody ChunkCompleteRequest request,
                                          Authentication authentication) {
        LessonDto response = lessonUploadService.completeUpload(sessionId, request, authentication.getName());
        return ApiResponse.<LessonDto>builder()
                .message("Hoàn tất upload thành công")
                .result(response)
                .build();
    }

    @DeleteMapping("/sessions/{sessionId}")
    ApiResponse<Void> abortUpload(@PathVariable String sessionId, Authentication authentication) {
        return lessonUploadService.abortUpload(sessionId, authentication.getName());
    }

    @GetMapping("/sessions/{sessionId}")
    ApiResponse<LessonUploadSessionResponse> getSession(@PathVariable String sessionId, Authentication authentication) {
        LessonUploadSessionResponse response = lessonUploadService.getSession(sessionId, authentication.getName());
        return ApiResponse.<LessonUploadSessionResponse>builder()
                .message("Lấy thông tin phiên upload thành công")
                .result(response)
                .build();
    }
}
