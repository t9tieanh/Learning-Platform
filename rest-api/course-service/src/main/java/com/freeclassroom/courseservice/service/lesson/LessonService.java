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

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
@Slf4j
public class LessonService implements ILessonService{
    LessonRepository lessonRepo;
    ChapterRepository chapterRepo;

    IUploadFileService uploadFileService;

    LessonMapper lessonMapper;

    @Override
    public ApiResponse<CreationResponse> addVideo(CreationVideoRequest lesson){
        ChapterEntity chapter =  chapterRepo.findById(lesson.getChapterId()).orElseThrow(
                () -> new CustomExeption(ErrorCode.CHAPTER_NOT_FOUND)
        );

        //upload file
        String imageUri = uploadFileService.uploadFile(lesson.getFile());

        //mapping to entity
        LessonEntity newLesson = lessonMapper.toEntity(lesson);
        newLesson.setType(EnumLessonType.Video);
        newLesson.setUrl(imageUri);

        //save
        newLesson.setChapter(chapter);
        chapter.getLessons().add(newLesson);
        chapterRepo.save(chapter);

        return ApiResponse.<CreationResponse>builder()
                .code(200)
                .message("Thêm video thành công !")
                .result(CreationResponse.builder()
                        .name(newLesson.getTitle())
                        .id(newLesson.getId())
                        .build())
                .build();
    }

    @Override
    public Flux<ServerSentEvent<String>> addVideoWithProgress(CreationVideoRequest lesson) {
        ChapterEntity chapter =  chapterRepo.findById(lesson.getChapterId()).orElseThrow(
                () -> new CustomExeption(ErrorCode.CHAPTER_NOT_FOUND)
        );

        return uploadFileService.uploadFileWithProgress(lesson.getFile())
                .map(percent -> ServerSentEvent.<String>builder()
                        .event("progress")
                        .data("{\"percent\": " + percent + "}")
                        .build())
                .concatWith(
                        Mono.defer(() -> {
                            //mapping to entity
                            LessonEntity newLesson = lessonMapper.toEntity(lesson);
                            newLesson.setType(EnumLessonType.Video);
                            newLesson.setUrl(imageUri);

                            //save
                            newLesson.setChapter(chapter);
                            chapter.getLessons().add(newLesson);
                            chapterRepo.save(chapter);

                            return Flux.just(
                                    ServerSentEvent.<String>builder()
                                            .event("saving_db")
                                            .data("{\"message\": \"Saving lesson info to DB...\"}")
                                            .build(),
                                    ServerSentEvent.<String>builder()
                                            .event("completed")
                                            .data("{\"lessonId\": \"" + newLesson.getId() + "\", \"message\": \"Lesson created successfully\"}")
                                            .build(),
                                    ServerSentEvent.<String>builder().data("[DONE]").build()
                            );
                        }
                )
    }
}
