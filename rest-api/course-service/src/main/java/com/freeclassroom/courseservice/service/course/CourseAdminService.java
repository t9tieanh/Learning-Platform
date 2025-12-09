package com.freeclassroom.courseservice.service.course;

import com.freeclassroom.courseservice.configuration.RabbitMQConfig;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.CreationResponse;
import com.freeclassroom.courseservice.dto.response.course.CourseListResponse;
import com.freeclassroom.courseservice.dto.response.course.PageResponse;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import com.freeclassroom.courseservice.entity.member.EnrollmentsEntity;
import com.freeclassroom.courseservice.enums.entity.EnumCourseProgressStep;
import com.freeclassroom.courseservice.enums.entity.EnumCourseStatus;
import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.exception.ErrorCode;
import com.freeclassroom.courseservice.grpc.client.UserGrpcClient;
import com.freeclassroom.courseservice.mapper.CourseMapper;
import com.freeclassroom.courseservice.mapper.InstructorMapper;
import com.freeclassroom.courseservice.mapper.CourseApprovalEventMapper;
import com.freeclassroom.courseservice.repository.entity.CourseRepository;
import com.freeclassroom.courseservice.dto.event.CourseApprovalEvent;
import com.freeclassroom.courseservice.enums.dto.CourseApprovalAction;
import com.freeclassroom.courseservice.repository.entity.EnrollmentRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
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
    CourseApprovalEventMapper courseApprovalEventMapper;
    EnrollmentRepository enrollmentRepository;

    private final RabbitTemplate rabbitTemplate;

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

        // public course
        course.setStatus(EnumCourseStatus.PUBLISHED);

        // add instructor to course

        if (!enrollmentRepository.existsByUserIdAndCourse_Id(course.getInstructorId(), courseId)) {
            EnrollmentsEntity enrollment = EnrollmentsEntity.builder()
                    .progress(0d)
                    .userId(course.getInstructorId())
                    .course(course)
                    .build();
            course.getEnrollments().add(enrollment);
        }

        // save
        courseRepo.save(course);

        // Map to event
        CourseApprovalEvent event = courseApprovalEventMapper.toEvent(course, CourseApprovalAction.APPROVED, null);
        event.setAction(CourseApprovalAction.APPROVED);
        event.setReason(course.getReason());
        rabbitTemplate.convertAndSend(RabbitMQConfig.COURSE_APPROVAL_EXCHANGE, RabbitMQConfig.COURSE_APPROVAL_ROUTING_KEY, event);

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

        // reject course
        course.setStatus(EnumCourseStatus.REJECTED);
        course.setReason(reason);
        courseRepo.save(course);

        // Map to event
        CourseApprovalEvent event = courseApprovalEventMapper.toEvent(course, CourseApprovalAction.REJECTED, reason);
        event.setAction(CourseApprovalAction.REJECTED);
        event.setReason(course.getReason());
        rabbitTemplate.convertAndSend(RabbitMQConfig.COURSE_APPROVAL_EXCHANGE, RabbitMQConfig.COURSE_APPROVAL_ROUTING_KEY, event);

        return ApiResponse.<CreationResponse>builder()
            .code(HttpStatus.OK.value())
            .message("Khóa học đã bị từ chối !")
            .build();
    }
}
