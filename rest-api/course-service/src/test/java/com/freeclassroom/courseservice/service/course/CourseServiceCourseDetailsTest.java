package com.freeclassroom.courseservice.service.course;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.course.CourseResponse;
import com.freeclassroom.courseservice.dto.response.member.EnrollmentResponse;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import com.freeclassroom.courseservice.entity.member.EnrollmentsEntity;
import com.freeclassroom.courseservice.grpc.client.UserGrpcClient;
import com.freeclassroom.courseservice.mapper.CourseMapper;
import com.freeclassroom.courseservice.mapper.EnrollmentMapper;
import com.freeclassroom.courseservice.mapper.LessonMapper;
import com.freeclassroom.courseservice.repository.entity.CategoryRepository;
import com.freeclassroom.courseservice.repository.entity.ChapterRepository;
import com.freeclassroom.courseservice.repository.entity.CourseRepository;
import com.freeclassroom.courseservice.repository.entity.TagRepository;
import com.freeclassroom.courseservice.service.utils.file.IUploadFileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CourseServiceCourseDetailsTest {

    @Mock private CourseRepository courseRepo;
    @Mock private CategoryRepository categoryRepo;
    @Mock private TagRepository tagRepo;
    @Mock private ChapterRepository chapterRepo;
    @Mock private CourseMapper courseMapper;
    @Mock private EnrollmentMapper enrollmentMapper;
    @Mock private LessonMapper lessonMapper;
    @Mock private UserGrpcClient userGrpcClient;
    @Mock private IUploadFileService fileService;

    private CourseService service;

    @BeforeEach
    void setUp() {
        service = new CourseService(
                courseRepo,
                categoryRepo,
                tagRepo,
                chapterRepo,
                courseMapper,
                enrollmentMapper,
                lessonMapper,
                userGrpcClient,
                fileService
        );
    }

    @Test
    void getCourse_shouldExcludeOwnerEnrollmentsFromResponse() {
        EnrollmentsEntity ownerEnrollment = EnrollmentsEntity.builder()
                .id("enroll-owner")
                .userId("instructor-1")
                .ownerEnrollment(true)
                .build();
        EnrollmentsEntity studentEnrollment = EnrollmentsEntity.builder()
                .id("enroll-student")
                .userId("student-1")
                .ownerEnrollment(false)
                .build();

        CourseEntity course = CourseEntity.builder()
                .id("course-1")
                .instructorId("instructor-1")
                .enrollments(Set.of(ownerEnrollment, studentEnrollment))
                .build();

        CourseResponse mappedResponse = CourseResponse.builder()
                .id("course-1")
                .chapters(List.of())
                .enrollments(List.of())
                .build();
        EnrollmentResponse studentResponse = EnrollmentResponse.builder().userId("student-1").build();

        when(courseRepo.findByIdWithTags("course-1")).thenReturn(Optional.of(course));
        when(courseRepo.findByIdWithChapters("course-1")).thenReturn(Optional.of(course));
        when(courseRepo.findByIdWithEnrollments("course-1")).thenReturn(Optional.of(course));
        when(courseMapper.toDto(course)).thenReturn(mappedResponse);
        when(enrollmentMapper.toDto(studentEnrollment)).thenReturn(studentResponse);

        ApiResponse<CourseResponse> response = service.getCourse("course-1");

        assertThat(response.getResult()).isNotNull();
        assertThat(response.getResult().getEnrollments()).containsExactly(studentResponse);
        verify(enrollmentMapper).toDto(studentEnrollment);
        verify(enrollmentMapper, never()).toDto(ownerEnrollment);
    }
}
