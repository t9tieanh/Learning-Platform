package com.freeclassroom.courseservice.service.course;

import com.example.grpc.user.TeacherDetail;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.course.instructor.*;
import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.grpc.client.BlogGrpcClient;
import com.freeclassroom.courseservice.grpc.client.UserGrpcClient;
import com.freeclassroom.courseservice.mapper.CourseMapper;
import com.freeclassroom.courseservice.mapper.InstructorMapper;
import com.freeclassroom.courseservice.repository.entity.ChapterRepository;
import com.freeclassroom.courseservice.repository.entity.CourseRepository;
import com.freeclassroom.courseservice.repository.entity.EnrollmentRepository;
import com.freeclassroom.courseservice.service.cache.RedisCacheService;
import com.freeclassroom.courseservice.service.search.CourseSearchService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseUserServiceInstructorCoursesTest {

    @Mock private CourseRepository courseRepo;
    @Mock private ChapterRepository chapterRepo;
    @Mock private EnrollmentRepository enrollmentRepo;
    @Mock private UserGrpcClient userGrpcClient;
    @Mock private BlogGrpcClient blogGrpcClient;
    @Mock private CourseMapper courseMapper;
    @Mock private InstructorMapper instructorMapper;
    @Mock private CourseSearchService courseSearchService;
    @Mock private RedisCacheService redisCacheService;

    private CourseUserService service;

    @BeforeEach
    void setUp() {
        service = new CourseUserService(
                courseRepo,
                chapterRepo,
                enrollmentRepo,
                userGrpcClient,
                blogGrpcClient,
                courseMapper,
                instructorMapper,
                courseSearchService,
                redisCacheService
        );
    }

    @Test
    void getPublicCoursesByInstructor_shouldReturnPagedData() {
        InstructorCourseRowProjection row = row("c1", "Java", 4.8, 120L, LocalDateTime.now());
        Page<InstructorCourseRowProjection> page = new PageImpl<>(List.of(row), PageRequest.of(0, 12), 1);
        when(courseRepo.findPublicInstructorCourses(anyString(), any(), any())).thenReturn(page);
        when(courseRepo.getPublicInstructorCourseStats(anyString())).thenReturn(stats(1L, 4.8));
        when(courseRepo.countLessonsByCourseIds(anyList())).thenReturn(List.of(lesson("c1", 10L)));
        when(userGrpcClient.getTeacherDetail(anyString())).thenReturn(teacher("i1"));

        ApiResponse<InstructorCoursesPageResponse> res = service.getPublicCoursesByInstructor(
                "i1", 1, 12, "java", "latest", "desc"
        );

        assertThat(res.getResult()).isNotNull();
        assertThat(res.getResult().getInstructor().getId()).isEqualTo("i1");
        assertThat(res.getResult().getStats().getTotalCourses()).isEqualTo(1L);
        assertThat(res.getResult().getCourses()).hasSize(1);
        assertThat(res.getResult().getCourses().get(0).getLessonsCount()).isEqualTo(10L);
        assertThat(res.getResult().getPagination().getTotalItems()).isEqualTo(1);
    }

    @Test
    void getPublicCoursesByInstructor_shouldHandleEmptyData() {
        Page<InstructorCourseRowProjection> emptyPage = new PageImpl<>(List.of(), PageRequest.of(0, 12), 0);
        when(courseRepo.findPublicInstructorCourses(anyString(), any(), any())).thenReturn(emptyPage);
        when(courseRepo.getPublicInstructorCourseStats(anyString())).thenReturn(stats(0L, null));
        when(userGrpcClient.getTeacherDetail(anyString())).thenReturn(teacher("i1"));

        ApiResponse<InstructorCoursesPageResponse> res = service.getPublicCoursesByInstructor(
                "i1", 1, 12, null, "latest", "desc"
        );

        assertThat(res.getResult().getCourses()).isEmpty();
        assertThat(res.getResult().getStats().getAverageRating()).isEqualTo(0.0);
        verify(courseRepo, never()).countLessonsByCourseIds(anyList());
    }

    @Test
    void getPublicCoursesByInstructor_shouldUseStudentsSortQuery() {
        Page<InstructorCourseRowProjection> page = new PageImpl<>(List.of(), PageRequest.of(0, 12), 0);
        when(courseRepo.findPublicInstructorCoursesOrderByStudentsDesc(anyString(), any(), any())).thenReturn(page);
        when(courseRepo.getPublicInstructorCourseStats(anyString())).thenReturn(stats(0L, 0.0));
        when(userGrpcClient.getTeacherDetail(anyString())).thenReturn(teacher("i1"));

        service.getPublicCoursesByInstructor("i1", 1, 12, "java", "students", "desc");

        verify(courseRepo, times(1)).findPublicInstructorCoursesOrderByStudentsDesc(eq("i1"), eq("java"), any());
    }

    @Test
    void getPublicCoursesByInstructor_shouldThrowBusinessErrorWhenUserServiceFails() {
        Page<InstructorCourseRowProjection> page = new PageImpl<>(List.of(), PageRequest.of(0, 12), 0);
        when(courseRepo.findPublicInstructorCourses(anyString(), any(), any())).thenReturn(page);
        when(courseRepo.getPublicInstructorCourseStats(anyString())).thenReturn(stats(0L, 0.0));
        when(userGrpcClient.getTeacherDetail(anyString())).thenThrow(new RuntimeException("grpc down"));

        assertThatThrownBy(() -> service.getPublicCoursesByInstructor("i1", 1, 12, null, "latest", "desc"))
                .isInstanceOf(CustomExeption.class);
    }

    private InstructorCourseRowProjection row(String id, String title, Double rating, Long students, LocalDateTime createdAt) {
        return new InstructorCourseRowProjection() {
            @Override public String getId() { return id; }
            @Override public String getTitle() { return title; }
            @Override public String getShortDescription() { return "desc"; }
            @Override public String getThumbnailUrl() { return "thumb"; }
            @Override public Double getOriginalPrice() { return 100.0; }
            @Override public Double getFinalPrice() { return 80.0; }
            @Override public Double getRating() { return rating; }
            @Override public LocalDateTime getCreatedAt() { return createdAt; }
            @Override public Long getStudentsCount() { return students; }
        };
    }

    private InstructorCourseStatsProjection stats(Long totalCourses, Double avg) {
        return new InstructorCourseStatsProjection() {
            @Override public Long getTotalCourses() { return totalCourses; }
            @Override public Double getAverageRating() { return avg; }
        };
    }

    private CourseLessonCountProjection lesson(String courseId, Long count) {
        return new CourseLessonCountProjection() {
            @Override public String getCourseId() { return courseId; }
            @Override public Long getLessonsCount() { return count; }
        };
    }

    private TeacherDetail teacher(String id) {
        return TeacherDetail.newBuilder()
                .setId(id)
                .setName("Instructor")
                .setEmail("instructor@example.com")
                .setImage("avatar.png")
                .setDescription("desc")
                .build();
    }
}
