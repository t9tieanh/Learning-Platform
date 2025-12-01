package com.freeclassroom.courseservice.service.chapter;

import com.freeclassroom.courseservice.dto.request.chapter.CreationChapterRequest;
import com.freeclassroom.courseservice.dto.request.chapter.UpdateChapterRequest;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.chapter.ChapterDto;
import com.freeclassroom.courseservice.dto.response.common.CreationResponse;
import com.freeclassroom.courseservice.dto.response.course.ChapterResponse;
import com.freeclassroom.courseservice.entity.course.ChapterEntity;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import com.freeclassroom.courseservice.enums.entity.EnumCourseProgressStep;
import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.exception.ErrorCode;
import com.freeclassroom.courseservice.mapper.ChapterMapper;
import com.freeclassroom.courseservice.repository.entity.ChapterRepository;
import com.freeclassroom.courseservice.repository.entity.CourseRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
@Slf4j
public class ChapterService implements IChapterService {
    ChapterRepository chapterRepo;
    CourseRepository courseRepo;

    ChapterMapper chapterMapper;

    @Override
    public ApiResponse<List<ChapterDto>> getChaptersByCourseId(String courseId){
        List<ChapterEntity> chapters = chapterRepo.findAllByCourseId(courseId);

        return ApiResponse.<List<ChapterDto>>builder()
                .code(200)
                .message("Lấy thông tin chapters thành công !")
                .result(
                    chapterMapper.toDtos(chapters)
                )
                .build();
    }

    @Override
    public ApiResponse<List<ChapterDto>> getAllChapters(){
        List<ChapterEntity> chapters = chapterRepo.findAll();

        return ApiResponse.<List<ChapterDto>>builder()
                .code(200)
                .message("Lấy thông tin chapters thành công !")
                .result(
                        chapterMapper.toDtos(chapters)
                )
                .build();
    }

    @Override
    public ApiResponse<ChapterResponse> findById(String chapterId) {
        ChapterEntity chapter = chapterRepo.findById(chapterId).orElseThrow(
                () -> new CustomExeption(ErrorCode.CHAPTER_NOT_FOUND)
        );

        return ApiResponse.<ChapterResponse>builder()
                .code(200)
                .message("Lấy thông tin chapter thành công !")
                .result(chapterMapper.toDto(chapter))
                .build();
    }

    @Override
    public ApiResponse<CreationResponse> addChapter(CreationChapterRequest newChapter) {
        CourseEntity course = courseRepo.findById(newChapter.getCourseId()).orElseThrow(
                () -> new CustomExeption(ErrorCode.COURSE_NOT_FOUND)
        );

        ChapterEntity chapter = chapterMapper.toEntity(newChapter);
        chapter.setCourse(course);

        course.getChapters().add(chapter);

        // set status for add chapter
        if (course.getStatus().equals(EnumCourseProgressStep.INTRO)) {
            course.setProgressStep(EnumCourseProgressStep.CURRICULUM);
        }

        courseRepo.save(course);

        return ApiResponse.<CreationResponse>builder()
                .code(200)
                .message("Thêm chương thành công !")
                .result(
                        CreationResponse.builder()
                                .id(chapter.getId())
                                .name(chapter.getTitle())
                                .build()
                )
                .build();
    }

    @Override
    public ApiResponse<ChapterResponse> updateChapter(String chapterId ,UpdateChapterRequest updateChapter) {
        ChapterEntity chapter = chapterRepo.findById(chapterId).orElseThrow(
                () -> new CustomExeption(ErrorCode.CHAPTER_NOT_FOUND)
        );

        chapter.setTitle(updateChapter.getTitle());
        chapter.setDescription(updateChapter.getDescription());

        if (updateChapter.getPosition() != null) {
            chapter.setPosition(updateChapter.getPosition());
        }

        chapterRepo.save(chapter);

        return ApiResponse.<ChapterResponse>builder()
                .code(200)
                .message("Chỉnh sửa chapter thành công !")
                .result(
                        chapterMapper.toDto(chapter)
                )
                .build();
    }

    @Override
    public boolean canEditChapter(String chapterId, String instructorId) {
        String ownerId = chapterRepo.findInstructorIdByChapterId(chapterId)
                .orElseThrow(() -> new CustomExeption(ErrorCode.UNAUTHORIZED));

        return ownerId.equals(instructorId);
    }

    public ApiResponse<CreationResponse> deleteChapterById(String chapterId) {
        //cout by lesson
        ChapterEntity chapter = chapterRepo.findById(chapterId).orElseThrow(
                () -> new CustomExeption(ErrorCode.CHAPTER_NOT_FOUND)
        );

        if (chapter.getLessons().isEmpty()) {
            chapterRepo.deleteById(chapterId);
        }
        else {
            chapter.setDeleted(true);
            chapterRepo.save(chapter);
        }
        return ApiResponse.<CreationResponse>builder()
                .code(200)
                .message("Xóa chương thành công !")
                .result(
                        CreationResponse.builder()
                                .id(chapterId)
                                .build()
                )
                .build();
    }
}
