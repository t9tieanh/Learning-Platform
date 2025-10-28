package com.freeclassroom.courseservice.service.chapter;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.chapter.ChapterUserResponse;
import com.freeclassroom.courseservice.entity.course.ChapterEntity;
import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.exception.ErrorCode;
import com.freeclassroom.courseservice.mapper.ChapterMapper;
import com.freeclassroom.courseservice.repository.entity.ChapterRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
@Slf4j
public class ChapterUserService implements IChapterUserService {
    ChapterRepository chapterRepo;

    ChapterMapper chapterMapper;

    @Override
    public ApiResponse<ChapterUserResponse> getChapterPublic(String id) {
        ChapterEntity chapter = chapterRepo.findById(id).orElseThrow(
                () -> new CustomExeption(ErrorCode.CHAPTER_NOT_FOUND)
        );

        ChapterUserResponse response = chapterMapper.toUserResponse(chapter);

        //filter public lesson
        response.getLessons().forEach(lesson -> {
            if (lesson.getIsPublic() == null || lesson.getIsPublic() == false) {
                lesson.setUrl(null);
            }
        });

        return ApiResponse.<ChapterUserResponse>builder()
                .code(200)
                .message("Lấy thông tin chapter thành công !")
                .result(response)
                .build();
    }
}
