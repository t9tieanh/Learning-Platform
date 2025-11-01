package com.freeclassroom.courseservice.service.course;

import com.example.grpc.user.GetTeachersRequest;
import com.example.grpc.user.GetTeachersResponse;
import com.example.grpc.user.GetUserResponse;
import com.example.grpc.user.Teacher;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.Pagination;
import com.freeclassroom.courseservice.dto.response.common.PagingResponse;
import com.freeclassroom.courseservice.dto.response.course.CourseUserDetailResponse;
import com.freeclassroom.courseservice.dto.response.course.ExpertiseResponse;
import com.freeclassroom.courseservice.dto.response.course.InstructorCourseResponse;
import com.freeclassroom.courseservice.dto.response.course.MyCourseResponse;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
                .expertise(
                        user.getExpertisesList().stream()
                                .map(expertise -> ExpertiseResponse.builder()
                                        .id(expertise.getId())
                                        .name(expertise.getName())
                                        .image(expertise.getImage())
                                        .build())
                                .toList()
                )
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

    @Override
    public ApiResponse<PagingResponse<MyCourseResponse>> getCourseUsers(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<CourseEntity> myCourses = courseRepo.findAllByUserId(userId, pageable);

        // Get Instructor Info
        List<String> instructorIds = myCourses
                .stream()
                .map(CourseEntity::getInstructorId)
                .distinct()
                .toList();

        GetTeachersResponse teachersResponse = userGrpcClient.getBulkTeachers(instructorIds);

        Map<String, Teacher> teacherMap = teachersResponse.getTeachersList()
                .stream()
                .collect(Collectors.toMap(Teacher::getId, t -> t));

        List<MyCourseResponse> courseResponses = myCourses.stream().map(course -> {
            Teacher teacher = teacherMap.get(course.getInstructorId());

            return MyCourseResponse.builder()
                    .id(course.getId().toString())
                    .title(course.getTitle())
                    .shortDescription(course.getShortDescription())
                    .thumbnailUrl(course.getThumbnailUrl())
                    .instructor(InstructorCourseResponse.builder()
                            .image(teacher != null ? teacher.getImage() : "")
                            .name(teacher != null ? teacher.getName() : "")
                            .phone(teacher != null ? teacher.getEmail() : "")
                            .build())
                    .rating(course.getRating())
                    .build();
        }).toList();

        return ApiResponse.<PagingResponse<MyCourseResponse>>builder()
                .code(200)
                .message("Lấy danh sách khóa học của bạn thành công !")
                .result(
                        PagingResponse.<MyCourseResponse>builder()
                                .items(courseResponses)
                                .pagination(
                                        Pagination.builder()
                                                .page(myCourses.getNumber())
                                                .size(myCourses.getSize())
                                                .totalPages(myCourses.getTotalPages())
                                                .totalItems(myCourses.getTotalElements())
                                                .build()
                                )
                                .build()
                )
                .build();
    }
}
