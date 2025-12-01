package com.freeclassroom.courseservice.service.course;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.CreationResponse;
import com.freeclassroom.courseservice.dto.response.course.CourseListResponse;
import com.freeclassroom.courseservice.dto.response.course.PageResponse;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import com.freeclassroom.courseservice.enums.entity.EnumCourseProgressStep;
import com.freeclassroom.courseservice.enums.entity.EnumCourseStatus;
import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.exception.ErrorCode;
import com.freeclassroom.courseservice.grpc.client.UserGrpcClient;
import com.freeclassroom.courseservice.mapper.CourseMapper;
import com.freeclassroom.courseservice.mapper.InstructorMapper;
import com.freeclassroom.courseservice.repository.entity.CourseRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
@Slf4j
public class CourseAdminService implements ICourseAdminService {
    CourseRepository courseRepo;
    CourseMapper courseMapper;
    UserGrpcClient  userClient;
    InstructorMapper instructorMapper;

    @Override
    public ApiResponse<PageResponse<CourseListResponse>> getCourses(int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page - 1), size, Sort.by("createdAt").descending());
        Page<CourseEntity> coursePage = courseRepo.findAll(pageable);
        List<CourseListResponse> items = courseMapper.toListResponse(coursePage.getContent());
        // get info of instructor
        items.stream().forEach(item -> {
            item.setInstructor(instructorMapper.toResponse(userClient.getUser(item.getInstructorId())));
        });
        PageResponse<CourseListResponse> pageResponse = PageResponse.<CourseListResponse>builder()
                .items(items)
                .page(coursePage.getNumber() + 1)
                .size(coursePage.getSize())
                .totalElements(coursePage.getTotalElements())
                .totalPages(coursePage.getTotalPages())
                .build();

        return ApiResponse.<PageResponse<CourseListResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách khóa học thành công")
                .result(pageResponse)
                .build();
    }

    @Override
    public ApiResponse<CreationResponse> approveCourse(String courseId) {
        CourseEntity course = courseRepo.findById(courseId).orElseThrow(
                () -> new CustomExeption(ErrorCode.COURSE_NOT_FOUND)
        );

        // puplic course
        course.setStatus(EnumCourseStatus.PUBLISHED);

        courseRepo.save(course);

        return ApiResponse.<CreationResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Khóa học đã được duyệt thành công !")
                .build();
    }

    @Override
    public ApiResponse<CreationResponse> rejectCourse(String courseId, String reason) {
        CourseEntity course = courseRepo.findById(courseId).orElseThrow(
                () -> new CustomExeption(ErrorCode.COURSE_NOT_FOUND)
        );

        // check status
        if (!(course.getProgressStep().equals(EnumCourseProgressStep.COMPLETED))) {
            throw new CustomExeption(ErrorCode.COURSE_NOT_DONE);
        }

        // puplic course
        course.setStatus(EnumCourseStatus.REJECTED);
        course.setReason(reason);

        courseRepo.save(course);

        return ApiResponse.<CreationResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Khóa học đã được duyệt thành công !")
                .build();
    }
}
