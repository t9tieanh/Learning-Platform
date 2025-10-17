package com.freeclassroom.courseservice.service.lesson;

import com.freeclassroom.courseservice.dto.request.lesson.CreationVideoRequest;
import org.springframework.http.codec.ServerSentEvent;
import reactor.core.publisher.Flux;

import java.io.IOException;

public interface ILessonService {
    Flux<ServerSentEvent<String>> addVideoWithProgress(CreationVideoRequest lesson) throws IOException;
}
