package com.freeclassroom.courseservice.service.course;

import com.freeclassroom.courseservice.dto.event.CourseApprovalEvent;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import com.freeclassroom.courseservice.entity.member.EnrollmentsEntity;
import com.freeclassroom.courseservice.grpc.client.UserGrpcClient;
import com.freeclassroom.courseservice.mapper.CourseApprovalEventMapper;
import com.freeclassroom.courseservice.mapper.CourseMapper;
import com.freeclassroom.courseservice.mapper.InstructorMapper;
import com.freeclassroom.courseservice.repository.entity.CourseRepository;
import com.freeclassroom.courseservice.repository.entity.EnrollmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CourseAdminServiceApproveCourseTest {

    @Mock private CourseRepository courseRepo;
    @Mock private CourseMapper courseMapper;
    @Mock private UserGrpcClient userClient;
    @Mock private InstructorMapper instructorMapper;
    @Mock private CourseApprovalEventMapper courseApprovalEventMapper;
    @Mock private EnrollmentRepository enrollmentRepository;
    @Mock private RabbitTemplate rabbitTemplate;

    private CourseAdminService service;

    @BeforeEach
    void setUp() {
        service = new CourseAdminService(
                courseRepo,
                courseMapper,
                userClient,
                instructorMapper,
                courseApprovalEventMapper,
                enrollmentRepository,
                rabbitTemplate
        );
    }

    @Test
    void approveCourse_shouldCreateOwnerEnrollmentForInstructor() {
        CourseEntity course = CourseEntity.builder()
                .id("course-1")
                .instructorId("instructor-1")
                .enrollments(null)
                .build();

        when(courseRepo.findById("course-1")).thenReturn(Optional.of(course));
        when(enrollmentRepository.existsByUserIdAndCourse_Id("instructor-1", "course-1")).thenReturn(false);
        when(courseApprovalEventMapper.toEvent(any(), any(), any())).thenReturn(new CourseApprovalEvent());
        when(userClient.getUserName("instructor-1")).thenReturn("Instructor One");

        service.approveCourse("course-1");

        ArgumentCaptor<CourseEntity> courseCaptor = ArgumentCaptor.forClass(CourseEntity.class);
        verify(courseRepo).save(courseCaptor.capture());

        CourseEntity savedCourse = courseCaptor.getValue();
        assertThat(savedCourse.getEnrollments()).hasSize(1);

        EnrollmentsEntity enrollment = savedCourse.getEnrollments().iterator().next();
        assertThat(enrollment.getUserId()).isEqualTo("instructor-1");
        assertThat(enrollment.getOwnerEnrollment()).isTrue();
        assertThat(enrollment.getCourse()).isEqualTo(savedCourse);

        verify(enrollmentRepository).existsByUserIdAndCourse_Id("instructor-1", "course-1");
        verify(userClient).getUserName("instructor-1");
        verify(rabbitTemplate).convertAndSend(any(String.class), any(String.class), any(CourseApprovalEvent.class));
    }
}
