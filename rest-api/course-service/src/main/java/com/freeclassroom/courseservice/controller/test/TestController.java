package com.freeclassroom.courseservice.controller.test;

import com.freeclassroom.courseservice.dto.request.lesson.CreationVideoRequest;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.CreationResponse;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import com.freeclassroom.courseservice.entity.member.EnrollmentsEntity;
import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.exception.ErrorCode;
import com.freeclassroom.courseservice.repository.entity.CourseRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/test")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TestController {

    CourseRepository courseRepository;

    @PostMapping("/register-course")
    public ApiResponse<CreationResponse> testRegister(
            @RequestParam("1") String courseId,
            @RequestParam("2") String userId
    ) {
        CourseEntity courseEntity = courseRepository.findById(courseId).orElseThrow(() -> new CustomExeption(ErrorCode.COURSE_NOT_FOUND));

        EnrollmentsEntity enrollmentsEntity =  EnrollmentsEntity.builder()
                .progress(8d)
                .userId(userId)
                .course(courseEntity)
                .build();

        courseEntity.getEnrollments().add(
                enrollmentsEntity
        );

        courseRepository.save(courseEntity);

        return ApiResponse.<CreationResponse>builder()
                .code(200)
                .message("Course registered successfully")
                .result(CreationResponse.builder()
                        .id(courseEntity.getId())
                        .build())
                .build();
    }
}
