package com.freeclassroom.courseservice.service.course;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.course.student.CourseDetailResponse;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import com.freeclassroom.courseservice.enums.entity.EnumCourseProgressStep;
import com.freeclassroom.courseservice.enums.entity.EnumCourseStatus;
import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.exception.ErrorCode;
import com.freeclassroom.courseservice.mapper.CourseStudentMapper;
import com.freeclassroom.courseservice.repository.entity.CourseRepository;
import com.freeclassroom.courseservice.repository.entity.EnrollmentRepository;
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

    @Override
    public ApiResponse<CourseDetailResponse> getCourseChapter(String courseId) {
        CourseEntity course = courseRepo.findById(courseId).orElseThrow(
                () -> new CustomExeption(ErrorCode.COURSE_NOT_FOUND)
        );

        // check status of course
        if (!course.getStatus().equals(EnumCourseStatus.PUBLISHED) || !course.getProgressStep().equals(EnumCourseProgressStep.COMPLETED))
            throw new CustomExeption(ErrorCode.COURSE_NOT_PUBLISHED);

        CourseDetailResponse result = courseStudentMapper.toCourseDetailDto(course);

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
