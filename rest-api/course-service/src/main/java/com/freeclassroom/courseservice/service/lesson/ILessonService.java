package com.freeclassroom.courseservice.service.lesson;

import com.freeclassroom.courseservice.dto.request.lesson.CreationDocumentRequest;
import com.freeclassroom.courseservice.dto.request.lesson.CreationVideoRequest;
import com.freeclassroom.courseservice.dto.request.lesson.UpdateLessonRequest;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.CreationResponse;
import org.springframework.http.codec.ServerSentEvent;
import reactor.core.publisher.Flux;

import java.io.IOException;

public interface ILessonService {
    Flux<ServerSentEvent<String>> addVideoWithProgress(CreationVideoRequest lesson) throws IOException;
    Flux<ServerSentEvent<String>> addDocumentWithProgress(CreationDocumentRequest lesson) throws IOException;
    ApiResponse<CreationResponse> deleteLesson(String lessonId);
    boolean canEditLesson(String lessonId, String instructorId);
    ApiResponse<CreationResponse> updateNameOfLesson(String lessonId, String content);
    ApiResponse<CreationResponse> updateMetaLesson(String lessonId, UpdateLessonRequest request);
}
