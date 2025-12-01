package com.freeclassroom.courseservice.service.lesson;

import com.freeclassroom.courseservice.dto.request.lesson.CreationDocumentRequest;
import com.freeclassroom.courseservice.dto.request.lesson.CreationVideoRequest;
import com.freeclassroom.courseservice.dto.request.lesson.UpdateLessonRequest;
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
    LessonRepository lessonRepo;
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
                            .data("{\"message\": \"Upload file thành công, đang lưu những dữ liệu còn lại !...\"}")
                            .build();

                    // save to db
                    LessonEntity newLesson = lessonMapper.ToEntity(lesson);
                    newLesson.setType(EnumLessonType.video);
                    newLesson.setUrl(fileUrl);
                    newLesson.setChapter(chapter);

                    chapter.getLessons().add(newLesson);
                    chapterRepo.save(chapter);

                    ServerSentEvent<String> completedEvent = ServerSentEvent.<String>builder()
                            .event("completed")
                            .data("{\"lessonId\": \"" + newLesson.getId() + "\", \"message\": \"Bài học đã được tải lên thành công !\"}")
                            .build();

                    return Flux.just(savingEvent, completedEvent);
                });
    }

    @Override
    public Flux<ServerSentEvent<String>> addDocumentWithProgress(CreationDocumentRequest lesson) throws IOException {
        ChapterEntity chapter = chapterRepo.findById(lesson.getChapterId())
                .orElseThrow(() -> new CustomExeption(ErrorCode.CHAPTER_NOT_FOUND));

        // if have file -> process like addVideo
        if (lesson.getFile() != null && !lesson.getFile().isEmpty()) {
            return uploadFileService.uploadFileWithProgress(lesson.getFile())
                    .flatMap(event -> {
                        // ongoing upload
                        if (event.getFileUrl() == null) {
                            return Mono.just(ServerSentEvent.<String>builder()
                                    .event("uploading")
                                    .data("{\"progress\": " + event.getProgress() + "}")
                                    .build());
                        }

                        // khi upload xong
                        String fileUrl = event.getFileUrl();

                        ServerSentEvent<String> savingEvent = ServerSentEvent.<String>builder()
                                .event("saving_db")
                                .data("{\"message\": \"Upload file thành công, đang lưu dữ liệu...\"}")
                                .build();

                        LessonEntity newLesson = lessonMapper.ToEntity(lesson);
                        newLesson.setType(EnumLessonType.article);
                        newLesson.setUrl(fileUrl);
                        newLesson.setChapter(chapter);

                        chapter.getLessons().add(newLesson);
                        chapterRepo.save(chapter);

                        ServerSentEvent<String> completedEvent = ServerSentEvent.<String>builder()
                                .event("completed")
                                .data("{\"lessonId\": \"" + newLesson.getId() + "\", \"message\": \"Bài học đã được tải lên thành công!\"}")
                                .build();

                        return Flux.just(savingEvent, completedEvent);
                    });
        }

        return Flux.defer(() -> {
            ServerSentEvent<String> creatingEvent = ServerSentEvent.<String>builder()
                    .event("saving_db")
                    .data("{\"message\": \"Đang khởi tạo bài học...\"}")
                    .build();

            LessonEntity newLesson = lessonMapper.ToEntity(lesson);
            newLesson.setType(EnumLessonType.article);
            newLesson.setUrl(null);
            newLesson.setChapter(chapter);

            chapter.getLessons().add(newLesson);
            chapterRepo.save(chapter);

            ServerSentEvent<String> completedEvent = ServerSentEvent.<String>builder()
                    .event("completed")
                    .data("{\"lessonId\": \"" + newLesson.getId() + "\", \"message\": \"Bài học đã được tạo thành công!\"}")
                    .build();

            return Flux.just(creatingEvent, completedEvent);
        });
    }

    @Override
    public ApiResponse<CreationResponse> deleteLesson(String lessonId) {
        LessonEntity lesson = lessonRepo.findById(lessonId).orElseThrow(
                () -> new CustomExeption(ErrorCode.LESSON_NOT_FOUND)
        );

        lesson.setDeleted(true);
        lessonRepo.save(lesson);
        return ApiResponse.<CreationResponse>builder()
                .code(200)
                .message("Xóa bài học thành công !")
                .result(CreationResponse.builder()
                        .id(lesson.getId())
                        .name(lesson.getTitle())
                        .build())
                .build();
    }

    @Override
    public ApiResponse<CreationResponse> updateNameOfLesson(String lessonId, String content) {
        LessonEntity lesson = lessonRepo.findById(lessonId).orElseThrow(
                () -> new CustomExeption(ErrorCode.LESSON_NOT_FOUND)
        );

        lesson.setTitle(lesson.getTitle());
        lessonRepo.save(lesson);

        return ApiResponse.<CreationResponse>builder()
                .code(200)
                .message("Xóa bài học thành công !")
                .result(CreationResponse.builder()
                        .id(lesson.getId())
                        .name(lesson.getTitle())
                        .build())
                .build();
    }

    @Override
    public ApiResponse<CreationResponse> updateMetaLesson(String lessonId, UpdateLessonRequest request) {
        LessonEntity lesson = lessonRepo.findById(lessonId).orElseThrow(
                () -> new CustomExeption(ErrorCode.LESSON_NOT_FOUND)
        );

        lesson.setTitle(lesson.getTitle());
        lesson.setContent(request.getContent());
        lesson.setIsPublic(request.getIsPublic());
        lessonRepo.save(lesson);

        return ApiResponse.<CreationResponse>builder()
                .code(200)
                .message("Xóa bài học thành công !")
                .result(CreationResponse.builder()
                        .id(lesson.getId())
                        .name(lesson.getTitle())
                        .build())
                .build();
    }

    @Override
    public boolean canEditLesson(String lessonId, String instructorId) {
        String ownerId = lessonRepo.findInstructorIdByLessonId(lessonId)
                .orElseThrow(() -> new CustomExeption(ErrorCode.UNAUTHORIZED));

        return ownerId.equals(instructorId);
    }
}
