package com.freeclassroom.courseservice.service.course;

import com.example.grpc.user.GetUserResponse;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.course.CourseUserDetailResponse;
import com.freeclassroom.courseservice.dto.response.course.InstructorCourseResponse;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import com.freeclassroom.courseservice.enums.entity.EnumCourseProgressStep;
import com.freeclassroom.courseservice.enums.entity.EnumCourseStatus;
import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.exception.ErrorCode;
import com.freeclassroom.courseservice.grpc.client.UserGrpcClient;
import com.freeclassroom.courseservice.mapper.CourseMapper;
import com.freeclassroom.courseservice.repository.entity.ChapterRepository;
import com.freeclassroom.courseservice.repository.entity.CourseRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
@Slf4j
public class CourseUserService implements ICourseUserService{
    CourseRepository courseRepo;
    ChapterRepository chapterRepo;
    UserGrpcClient userGrpcClient;

    CourseMapper courseMapper;

    @Override
    public ApiResponse<CourseUserDetailResponse> getCourseDetail(String id) {
        CourseEntity course = courseRepo.findById(id)
                .orElseThrow(() -> new CustomExeption(ErrorCode.COURSE_NOT_FOUND));

        // check status of course
        if (!course.getStatus().equals(EnumCourseStatus.PUBLISHED) || !course.getProgressStep().equals(EnumCourseProgressStep.COMPLETED))
            throw new CustomExeption(ErrorCode.COURSE_NOT_PUBLISHED);


        CourseUserDetailResponse response = courseMapper.toResponseDto(course);

        //get info of instructor
        GetUserResponse user = userGrpcClient.getUser(
                course.getInstructorId().toString()
        );

        response.setInstructor(InstructorCourseResponse.builder()
                .phone(user.getPhone())
                .name(user.getName())
                .email(user.getEmail())
                .image(user.getImage())
                .username(user.getUsername())
                .description(user.getDescription())
                .id(user.getId())
                .numCourse(courseRepo.countByInstructorIdAndNotDeleted(user.getId()))
                .build());

        // get add infomation of chapter
        response.getChapters().forEach(chapter -> {
            chapter.setDuration(chapterRepo.getTotalVideoDurationByChapterId(chapter.getId()));
            chapter.setLessonNum(chapterRepo.countLessonsByChapterId(chapter.getId()));
        });

        return ApiResponse.<CourseUserDetailResponse>builder()
                .code(200)
                .message("Lấy thông tin khóa học thành công !")
                .result(response)
                .build();
    }
}
