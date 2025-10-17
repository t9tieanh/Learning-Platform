package com.freeclassroom.courseservice.service.lesson;

import com.freeclassroom.courseservice.dto.request.lesson.CreationVideoRequest;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.CreationResponse;
import org.springframework.http.codec.ServerSentEvent;
import reactor.core.publisher.Flux;

public interface ILessonService {
    ApiResponse<CreationResponse> addVideo(CreationVideoRequest lesson);
    Flux<ServerSentEvent<String>> addVideoWithProgress(CreationVideoRequest lesson);
}
