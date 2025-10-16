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
import org.springframework.stereotype.Service;

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
}
