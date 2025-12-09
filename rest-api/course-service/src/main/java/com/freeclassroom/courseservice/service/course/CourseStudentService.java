package com.freeclassroom.courseservice.service.course;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.course.student.CourseDetailResponse;
import com.freeclassroom.courseservice.dto.response.user.InstructorResponse;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import com.freeclassroom.courseservice.entity.member.EnrollmentsEntity;
import com.freeclassroom.courseservice.enums.entity.EnumCourseProgressStep;
import com.freeclassroom.courseservice.enums.entity.EnumCourseStatus;
import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.exception.ErrorCode;
import com.freeclassroom.courseservice.grpc.client.UserGrpcClient;
import com.freeclassroom.courseservice.mapper.CourseStudentMapper;
import com.freeclassroom.courseservice.repository.entity.CourseRepository;
import com.freeclassroom.courseservice.repository.entity.EnrollmentRepository;
import com.freeclassroom.courseservice.repository.entity.LessonRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
@Slf4j
public class CourseStudentService implements ICourseStudentService{
    EnrollmentRepository enrollmentRepo;
    CourseRepository courseRepo;
    CourseStudentMapper courseStudentMapper;
    LessonRepository lessonRepo;
    UserGrpcClient userGrpcClient;

    @Override
    public ApiResponse<CourseDetailResponse> getCourseChapter(String courseId, String userId) {
        EnrollmentsEntity enrollment = enrollmentRepo.findByUserIdAndCourse_Id(userId, courseId)
                .orElseThrow(() -> new CustomExeption(ErrorCode.UNAUTHORIZED));

        CourseEntity course = courseRepo.findById(courseId).orElseThrow(
                () -> new CustomExeption(ErrorCode.COURSE_NOT_FOUND)
        );

        // check status of course
        if (!course.getStatus().equals(EnumCourseStatus.PUBLISHED))
            throw new CustomExeption(ErrorCode.COURSE_NOT_PUBLISHED);

        CourseDetailResponse result = courseStudentMapper.toCourseDetailDto(course);

        InstructorResponse instructor = new InstructorResponse();
        instructor.setId(userId);

        result.setInstructor(instructor);
        //get data of lesson (include progress)
        result.getChapters().stream().forEach(chapter -> {
            chapter.setLessons(lessonRepo.findLessonOverviewWithProgressByChapter(chapter.getId(), enrollment.getId()));
        });

        return ApiResponse.<CourseDetailResponse>builder()
                .result(result)
                .code(200)
                .message("Lấy thông tin khóa học thành công !")
                .build();
    }

    @Override
    public boolean isEnrolledInCourse(String courseId, String userId) {
        boolean result = enrollmentRepo.existsByUserIdAndCourse_Id(userId, courseId);
        if (!result)
            throw new CustomExeption(ErrorCode.UNAUTHORIZED);
        return true;
    }
}
