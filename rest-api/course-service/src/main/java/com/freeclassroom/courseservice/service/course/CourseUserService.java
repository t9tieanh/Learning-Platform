package com.freeclassroom.courseservice.service.course;

import com.example.grpc.user.GetTeachersResponse;
import com.example.grpc.user.GetUserResponse;
import com.example.grpc.user.Teacher;
import com.example.grpc.user.TeacherDetail;
import com.freeclassroom.courseservice.dto.grpc.FeedbackDto;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.Pagination;
import com.freeclassroom.courseservice.dto.response.common.PagingResponse;
import com.freeclassroom.courseservice.dto.response.course.*;
import com.freeclassroom.courseservice.dto.response.user.InstructorResponse;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import com.freeclassroom.courseservice.entity.member.EnrollmentsEntity;
import com.freeclassroom.courseservice.enums.entity.EnumCourseProgressStep;
import com.freeclassroom.courseservice.enums.entity.EnumCourseStatus;
import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.exception.ErrorCode;
import com.freeclassroom.courseservice.grpc.client.BlogGrpcClient;
import com.freeclassroom.courseservice.grpc.client.UserGrpcClient;
import com.freeclassroom.courseservice.mapper.CourseMapper;
import com.freeclassroom.courseservice.mapper.InstructorMapper;
import com.freeclassroom.courseservice.repository.entity.ChapterRepository;
import com.freeclassroom.courseservice.repository.entity.CourseRepository;
import com.freeclassroom.courseservice.repository.entity.EnrollmentRepository;
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

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
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
    EnrollmentRepository enrollmentRepo;
    UserGrpcClient userGrpcClient;
    BlogGrpcClient blogGrpcClient;

    CourseMapper courseMapper;
    InstructorMapper instructorMapper;

    @Override
    public ApiResponse<CourseUserDetailResponse> getCourseDetail(String id, String userId) {
        CourseEntity course = courseRepo.findById(id)
                .orElseThrow(() -> new CustomExeption(ErrorCode.COURSE_NOT_FOUND));

        // check status of course
        if (!course.getStatus().equals(EnumCourseStatus.PUBLISHED) || !course.getProgressStep().equals(EnumCourseProgressStep.COMPLETED))
            throw new CustomExeption(ErrorCode.COURSE_NOT_PUBLISHED);

        CourseUserDetailResponse response = courseMapper.toResponseDto(course);

        // check user is student buyed this course
        response.setPurchased(false);
        if (userId != null && !userId.equals("anonymousUser")) {
            boolean purchased = enrollmentRepo.existsByUserIdAndCourse_Id(userId, course.getId());
            response.setPurchased(purchased);
        }

        //get info of instructor
        response.setInstructor(instructorMapper.toResponse(
                userGrpcClient.getTeacherDetail(
                        course.getInstructorId().toString()
                )
        ));

        // get add infomation of chapter
        response.getChapters().forEach(chapter -> {
            chapter.setDuration(chapterRepo.getTotalVideoDurationByChapterId(chapter.getId()));
            chapter.setLessonNum(chapterRepo.countLessonsByChapterId(chapter.getId()));
        });

        // get feedback of course
        response.setFeedbacks(blogGrpcClient.getFeedbackByCourseId(course.getId()));

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

    @Override
    public ApiResponse<List<CourseResponse>> getBestSellerCourse(int limit) {
        try {
            Pageable pageable = PageRequest.of(0, limit);
            List<CourseEntity> courseEntities = courseRepo.findBestSellerCourses(pageable);

            List<CourseResponse> courses = getInstructorGrpc(courseEntities);

            return ApiResponse.<List<CourseResponse>>builder()
                    .code(HttpStatus.OK.value())
                    .message("Thành công")
                    .result(courses)
                    .build();

        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.<List<CourseResponse>>builder()
                    .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Lỗi: " + e.getMessage())
                    .result(null)
                    .build();
        }
    }

    @Override
    public ApiResponse<List<CourseResponse>> getTrendyCourse(int limit) {
        try {
            int month = LocalDate.now().getMonthValue();
            int year = LocalDate.now().getYear();
            Pageable pageable = PageRequest.of(0, limit);
            List<CourseEntity> courseEntities = courseRepo.getTrendyCourse(pageable, month, year);

            List<CourseResponse> courses = getInstructorGrpc(courseEntities);

            return ApiResponse.<List<CourseResponse>>builder()
                    .code(HttpStatus.OK.value())
                    .message("Thành công")
                    .result(courses)
                    .build();
        } catch (Exception e) {
            return ApiResponse.<List<CourseResponse>>builder()
                    .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Lỗi: " + e.getMessage())
                    .result(null)
                    .build();
        }
    }

    @Override
    public ApiResponse<PageResponse<CourseResponse>> getAllCourses(int page, int limit, String search, String category,
                                                                   Double minPrice, Double minRating, String sort) {
        try {
            Sort sortOption = switch (sort) {
                case "price-low" -> Sort.by(Sort.Direction.ASC, "finalPrice");
                case "price-high" -> Sort.by(Sort.Direction.DESC, "finalPrice");
                default -> Sort.by(Sort.Direction.DESC, "createdAt");
            };

            Pageable pageable = PageRequest.of(Math.max(page - 1, 0), limit, sortOption);

            Page<CourseEntity> result = courseRepo.findAllWithFilters(search, category, minPrice, minRating, pageable);

            List<CourseResponse> content = getInstructorGrpc(result.getContent());

            PageResponse<CourseResponse> pageResponse = new PageResponse<>(
                    content,
                    result.getNumber() + 1,
                    result.getSize(),
                    result.getTotalElements(),
                    result.getTotalPages()
            );

            return ApiResponse.<PageResponse<CourseResponse>>builder()
                    .code(HttpStatus.OK.value())
                    .message("Lấy danh sách khóa học thành công")
                    .result(pageResponse)
                    .build();

        } catch (Exception e) {
            return ApiResponse.<PageResponse<CourseResponse>>builder()
                    .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Lỗi: " + e.getMessage())
                    .result(null)
                    .build();
        }
    }

    @Override
    public ApiResponse<List<CourseResponse>> getEnrolledCourses(String userRole, String studentId, String instructorId) {
        try {
            List<CourseEntity> courses = new ArrayList<>();

            if ("instructor".equals(userRole)) {
                // 1. Lấy danh sách enrollment của student
                List<EnrollmentsEntity> enrollments = enrollmentRepo.findAllByUserId(studentId);

                // 2. Lọc ra các courseId mà instructor trùng yêu cầu
                List<String> courseIds = enrollments.stream()
                        .map(e -> e.getCourse().getId())
                        .distinct()
                        .toList();

                // 3. Lấy tất cả course dựa trên courseIds
                List<CourseEntity> allCourses = courseRepo.findAllById(courseIds);

                // 4. Chỉ giữ course có instructorId trùng khớp
                courses = allCourses.stream()
                        .filter(c -> c.getInstructorId().equals(instructorId))
                        .filter(c -> (EnumCourseStatus.PUBLISHED.name()).equalsIgnoreCase(String.valueOf(c.getStatus())))
                        .filter(c -> (EnumCourseProgressStep.COMPLETED.name()).equalsIgnoreCase(String.valueOf(c.getProgressStep())))
                        .toList();
            } else {
                // Nếu không phải instructor thì lấy theo instructorId
                List<CourseEntity> allCourses = courseRepo.findAllByInstructorId(instructorId);

                courses = allCourses.stream()
                        .filter(c -> (EnumCourseStatus.PUBLISHED.name()).equalsIgnoreCase(String.valueOf(c.getStatus())))
                        .filter(c -> (EnumCourseProgressStep.COMPLETED.name()).equalsIgnoreCase(String.valueOf(c.getProgressStep())))
                        .toList();
            }

            List<CourseResponse> response = new ArrayList<>();
            for (CourseEntity course : courses) {
                response.add(courseMapper.toDto(course));
            }

            return ApiResponse.<List<CourseResponse>>builder()
                    .code(HttpStatus.OK.value())
                    .message("Lấy danh sách khóa học thành công")
                    .result(response)
                    .build();
        } catch (Exception e) {
            e.printStackTrace(); // Log ra console hoặc dùng logger
            return ApiResponse.<List<CourseResponse>>builder()
                    .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Đã xảy ra lỗi khi lấy danh sách khóa học: " + e.getMessage())
                    .result(Collections.emptyList())
                    .build();
        }
    }

    @Override
    public ApiResponse<Integer> countInstructorCourseValid(String instructorId) {
        try {
            List<CourseEntity> courses = courseRepo.findAllByInstructorId(instructorId);
            System.out.println("COURSES: " + courses);
            long validCount = courses.stream()
                    .filter(c -> EnumCourseStatus.PUBLISHED.name().equalsIgnoreCase(String.valueOf(c.getStatus())))
                    .filter(c -> EnumCourseProgressStep.COMPLETED.name().equalsIgnoreCase(String.valueOf(c.getProgressStep())))
                    .count();
            System.out.println("validCount: " + validCount);

            return ApiResponse.<Integer>builder()
                    .code(HttpStatus.OK.value())
                    .message("Lấy dữ liệu thành công")
                    .result((int) validCount)
                    .build();

        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.<Integer>builder()
                    .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Đã xảy ra lỗi khi đếm khóa học hợp lệ: " + e.getMessage())
                    .result(0)
                    .build();
        }
    }

    // general code
    private List<CourseResponse> getInstructorGrpc(List<CourseEntity> courseEntities) {
        return courseEntities.stream()
                .map(entity -> {
                    CourseResponse dto = courseMapper.toDto(entity);

                    // Gọi sang user-service để lấy instructor
                    GetUserResponse user = userGrpcClient.getUser(
                            entity.getInstructorId().toString()
                    );

                    dto.setInstructor(new InstructorResponse(
                            user.getId(),
                            user.getName(),
                            user.getEmail(),
                            user.getImage(),
                            0
                    ));
                    return dto;
                })
                .toList();
    }
}
