package com.freeclassroom.courseservice.controller;

import com.freeclassroom.courseservice.dto.request.lesson.CreationVideoRequest;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/lessons")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LessonController {
    ILessonService lessonService;

    @PostMapping("/video")
    @PreAuthorize("@chapterService.canEditChapter(#lesson.chapterId, authentication.name)")
    ApiResponse<CreationResponse> addVideo(@RequestPart(value = "video") MultipartFile video,
                                           @RequestPart(value = "lesson")CreationVideoRequest lesson){
        if(video.isEmpty()){
            throw new CustomExeption(ErrorCode.FILE_NOT_FOUND);
        }
        lesson.setFile(video);
        return lessonService.addVideo(lesson);
    }

    @PostMapping("/video")
    @PreAuthorize("@chapterService.canEditChapter(#lesson.chapterId, authentication.name)")
    Flux<ServerSentEvent<String>> addVideoWithProgress(@RequestPart(value = "video") MultipartFile video,
                                                       @RequestPart(value = "lesson")CreationVideoRequest lesson){
        if(video.isEmpty()){
            throw new CustomExeption(ErrorCode.FILE_NOT_FOUND);
        }
        lesson.setFile(video);
        return lessonService.addVideo(lesson);
    }
}
