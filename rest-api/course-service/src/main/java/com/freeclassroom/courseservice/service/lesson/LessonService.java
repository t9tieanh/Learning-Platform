package com.freeclassroom.courseservice.service.lesson;

import com.freeclassroom.courseservice.dto.request.lesson.CreationVideoRequest;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.CreationResponse;
import com.freeclassroom.courseservice.entity.course.ChapterEntity;
import com.freeclassroom.courseservice.entity.course.LessonEntity;
import com.freeclassroom.courseservice.enums.entity.EnumLessonType;
import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.exception.ErrorCode;
import com.freeclassroom.courseservice.mapper.LessonMapper;
import com.freeclassroom.courseservice.repository.entity.ChapterRepository;
import com.freeclassroom.courseservice.repository.entity.LessonRepository;
import com.freeclassroom.courseservice.service.utils.file.IUploadFileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.IOException;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
@Slf4j
public class LessonService implements ILessonService{
    ChapterRepository chapterRepo;

    IUploadFileService uploadFileService;

    LessonMapper lessonMapper;

    @Override
    public Flux<ServerSentEvent<String>> addVideoWithProgress(CreationVideoRequest lesson) throws IOException {
        ChapterEntity chapter = chapterRepo.findById(lesson.getChapterId())
                .orElseThrow(() -> new CustomExeption(ErrorCode.CHAPTER_NOT_FOUND));

        return uploadFileService.uploadFileWithProgress(lesson.getFile())
                .flatMap(event -> {
                    // ongoing upload
                    if (event.getFileUrl() == null) {
                        return Mono.just(ServerSentEvent.<String>builder()
                                .event("uploading")
                                .data("{\"progress\": " + event.getProgress() + "}")
                                .build());
                    }

                    // when finish upload
                    String fileUrl = event.getFileUrl();

                    // send event "saving_db"
                    ServerSentEvent<String> savingEvent = ServerSentEvent.<String>builder()
                            .event("saving_db")
                            .data("{\"message\": \"Saving lesson info to DB...\"}")
                            .build();

                    // save to db
                    LessonEntity newLesson = lessonMapper.toEntity(lesson);
                    newLesson.setType(EnumLessonType.Video);
                    newLesson.setUrl(fileUrl);
                    newLesson.setChapter(chapter);

                    chapter.getLessons().add(newLesson);
                    chapterRepo.save(chapter);

                    ServerSentEvent<String> completedEvent = ServerSentEvent.<String>builder()
                            .event("completed")
                            .data("{\"lessonId\": \"" + newLesson.getId() + "\", \"message\": \"Lesson created successfully\"}")
                            .build();

                    return Flux.just(savingEvent, completedEvent);
                });
    }

}
