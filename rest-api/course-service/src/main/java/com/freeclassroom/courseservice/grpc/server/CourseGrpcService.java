package com.freeclassroom.courseservice.grpc.server;

import com.example.grpc.course.*;
import com.example.grpc.user.*;
import com.example.grpc.user.CourseServiceGrpc.CourseServiceImplBase;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import com.freeclassroom.courseservice.entity.member.EnrollmentsEntity;
import com.freeclassroom.courseservice.entity.category.TagEntity;
import com.freeclassroom.courseservice.dto.response.admin.AdminActiveCourseProjection;
import com.freeclassroom.courseservice.dto.response.admin.AdminInstructorLeaderboardProjection;
import com.freeclassroom.courseservice.enums.entity.EnumCourseStatus;
import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.exception.ErrorCode;
import com.freeclassroom.courseservice.grpc.client.SaleGrpcClient;
import com.freeclassroom.courseservice.grpc.client.UserGrpcClient;
import com.freeclassroom.courseservice.repository.entity.CourseRepository;
import com.freeclassroom.courseservice.repository.entity.EnrollmentRepository;
import com.freeclassroom.courseservice.service.lesson.ILessonService;
import com.freeclassroom.courseservice.service.lesson.ILessonStudentService;
import com.google.protobuf.Empty;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@GrpcService
@RequiredArgsConstructor
public class CourseGrpcService extends CourseServiceImplBase {
    private final CourseRepository courseRepo;
    private final EnrollmentRepository enrollmentRepo;
    private final UserGrpcClient userGrpcClient;
    private final SaleGrpcClient saleGrpcClient;
    private final ILessonService lessonService;
    private final ILessonStudentService lessonStudentService;

    @Override
    public void getCourse(GetCourseRequest request, StreamObserver<CourseResponse> responseObserver) {
        CourseEntity course = courseRepo.findById(request.getId())
                .orElseThrow(() -> new CustomExeption(ErrorCode.COURSE_NOT_FOUND));

        CourseResponse.Builder builder = CourseResponse.newBuilder()
                .setId(course.getId() != null ? course.getId() : "")
                .setTitle(course.getTitle() != null ? course.getTitle() : "")
                .setShortDescription(course.getShortDescription() != null ? course.getShortDescription() : "")
                .setLongDescription(course.getLongDescription() != null ? course.getLongDescription() : "")
                .setThumbnailUrl(course.getThumbnailUrl() != null ? course.getThumbnailUrl() : "")
                .setRating(course.getRating() != null ? course.getRating() : 0.0)
                .setIntroductoryVideo(course.getIntroductoryVideo() != null ? course.getIntroductoryVideo() : "")
                .setLanguage(course.getLanguage() != null ? course.getLanguage() : "")
                .setOriginalPrice(course.getOriginalPrice() != null ? course.getOriginalPrice() : 0.0)
                .setFinalPrice(course.getFinalPrice() != null ? course.getFinalPrice() : 0.0);


        GetUserResponse instructor = userGrpcClient.getUser(course.getInstructorId());
        if (instructor != null) {
            Teacher teacher = Teacher.newBuilder()
                    .setId(instructor.getId() != null ? instructor.getId() : "")
                    .setName(instructor.getName() != null ? instructor.getName() : "")
                    .setEmail(instructor.getEmail() != null ? instructor.getEmail() : "")
                    .setImage(instructor.getImage() != null ? instructor.getImage() : "")
                    .build();
            builder.setInstructor(teacher);
        }

        responseObserver.onNext(builder.build());
        responseObserver.onCompleted();
    }

    @Override
    public void getBulkCourses(GetCoursesRequest request, StreamObserver<GetCoursesResponse> responseObserver) {
        try {
            List<CourseEntity> myCourses = courseRepo.findAllById(request.getCourseIdsList());

            boolean hasInvalidCourse = myCourses.stream()
                    .anyMatch(course ->
                            !EnumCourseStatus.PUBLISHED.equals(course.getStatus())
                    );

            if (hasInvalidCourse) {
                throw new CustomExeption(ErrorCode.COURSE_NOT_FOUND);
            }

            List<String> instructorIds = myCourses.stream()
                    .map(CourseEntity::getInstructorId)
                    .filter(Objects::nonNull)
                    .distinct()
                    .toList();

            GetTeachersResponse teachersResponse = userGrpcClient.getBulkTeachers(instructorIds);

            Map<String, Teacher> teacherMap = teachersResponse.getTeachersList()
                    .stream()
                    .collect(Collectors.toMap(Teacher::getId, t -> t));

            List<CourseResponse> courseResponses = myCourses.stream()
                    .map(course -> {
                        CourseResponse.Builder builder = CourseResponse.newBuilder()
                                .setId(course.getId() != null ? course.getId() : "")
                                .setTitle(course.getTitle() != null ? course.getTitle() : "")
                                .setShortDescription(course.getShortDescription() != null ? course.getShortDescription() : "")
                                .setLongDescription(course.getLongDescription() != null ? course.getLongDescription() : "")
                                .setThumbnailUrl(course.getThumbnailUrl() != null ? course.getThumbnailUrl() : "")
                                .setRating(course.getRating() != null ? course.getRating() : 0.0)
                                .setIntroductoryVideo(course.getIntroductoryVideo() != null ? course.getIntroductoryVideo() : "")
                                .setLanguage(course.getLanguage() != null ? course.getLanguage() : "")
                                .setOriginalPrice(course.getOriginalPrice() != null ? course.getOriginalPrice() : 0.0)
                                .setFinalPrice(course.getFinalPrice() != null ? course.getFinalPrice() : 0.0);

                        Teacher teacher = teacherMap.get(course.getInstructorId());
                        if (teacher != null) {
                            builder.setInstructor(teacher);
                        }

                        return builder.build();
                    })
                    .toList();

            GetCoursesResponse response = GetCoursesResponse.newBuilder()
                    .addAllCourses(courseResponses)
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            responseObserver.onError(
                    io.grpc.Status.NOT_FOUND
                            .withDescription(e.getMessage())
                            .asRuntimeException()
            );
        }
    }

    @Override
    public void listEnrolledCourses(EnrolledCoursesRequest request, StreamObserver<GetCoursesResponse> responseObserver) {
        if(request.getUserRole().equals("instructor")) {
            List<EnrollmentsEntity> enrollments = enrollmentRepo.findAllByUserId(request.getStudentId());

            List<String> courseIds = enrollments.stream()
                    .map(enrollment -> enrollment.getCourse().getId())
                    .distinct()
                    .toList();

            List<CourseEntity> courses = courseRepo.findAllById(courseIds);

            List<CourseEntity> filteredCourses = courses.stream()
                    .filter(course -> course.getInstructorId().equals(request.getInstructorId()))
                    .toList();

            convertCourseDTO(responseObserver, filteredCourses);
        } else {
            List<CourseEntity> courses = courseRepo.findAllByInstructorId(request.getInstructorId());
            convertCourseDTO(responseObserver, courses);
        }
    }


    private void convertCourseDTO(StreamObserver<GetCoursesResponse> responseObserver, List<CourseEntity> courses) {
        List<CourseResponse> courseResponses = courses.stream()
                .map(course -> CourseResponse.newBuilder()
                        .setId(course.getId() != null ? course.getId() : "")
                        .setTitle(course.getTitle() != null ? course.getTitle() : "")
                        .setShortDescription(course.getShortDescription() != null ? course.getShortDescription() : "")
                        .setLongDescription(course.getLongDescription() != null ? course.getLongDescription() : "")
                        .setThumbnailUrl(course.getThumbnailUrl() != null ? course.getThumbnailUrl() : "")
                        .setRating(course.getRating() != null ? course.getRating() : 0.0)
                        .setIntroductoryVideo(course.getIntroductoryVideo() != null ? course.getIntroductoryVideo() : "")
                        .setLanguage(course.getLanguage() != null ? course.getLanguage() : "")
                        .setOriginalPrice(course.getOriginalPrice() != null ? course.getOriginalPrice() : 0.0)
                        .setFinalPrice(course.getFinalPrice() != null ? course.getFinalPrice() : 0.0)
                        .build()
                )
                .toList();

        GetCoursesResponse response = GetCoursesResponse.newBuilder()
                .addAllCourses(courseResponses)
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void getCourseAdminData(
            Empty request,
            StreamObserver<GetCourseAdminDataResponse> responseObserve
    ) {
        try {
            long totalCourse = Optional.ofNullable(courseRepo.countActiveCoursesForAdmin()).orElse(0L);
            long totalInstructor = Optional.ofNullable(courseRepo.countActiveInstructorsForAdmin()).orElse(0L);

            GetCourseAdminDataResponse response = GetCourseAdminDataResponse.newBuilder()
                    .setTotalCourse(totalCourse)
                    .setTotalInstructor(totalInstructor)
                    .build();

            responseObserve.onNext(response);
            responseObserve.onCompleted();
        } catch (Exception e) {
            responseObserve.onError(
                    Status.INTERNAL
                            .withDescription("Failed to load admin data: " + e.getMessage())
                            .asRuntimeException()
            );
        }
    }

    @Override
    public void getActiveAdminCourses(Empty request, StreamObserver<GetActiveAdminCoursesResponse> responseObserver) {
        try {
            List<ActiveAdminCourseStat> items = courseRepo.findActiveAdminCourseStats().stream()
                    .map(stat -> ActiveAdminCourseStat.newBuilder()
                            .setCourseId(stat.getCourseId() == null ? "" : stat.getCourseId())
                            .setInstructorId(stat.getInstructorId() == null ? "" : stat.getInstructorId())
                            .setTitle(stat.getTitle() == null ? "" : stat.getTitle())
                            .setThumbnailUrl(stat.getThumbnailUrl() == null ? "" : stat.getThumbnailUrl())
                            .setRating(stat.getRating() == null ? 0D : stat.getRating())
                            .setStudentCount(stat.getStudentCount() == null ? 0L : stat.getStudentCount())
                            .build())
                    .toList();

            responseObserver.onNext(GetActiveAdminCoursesResponse.newBuilder().addAllItems(items).build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            responseObserver.onError(
                    Status.INTERNAL
                            .withDescription("Failed to load active admin courses: " + e.getMessage())
                            .asRuntimeException()
            );
        }
    }

    @Override
    public void getAdminTopInstructorsLeaderboard(
            GetAdminTopInstructorsRequest request,
            StreamObserver<GetAdminInstructorLeaderboardResponse> responseObserver
    ) {
        try {
            int normalizedLimit = Math.max(1, request.getLimit());
            Pageable pageable = PageRequest.of(0, normalizedLimit);

            List<AdminInstructorLeaderboardItem> items = courseRepo.findAdminTopInstructorLeaderboard(pageable).stream()
                    .map(stat -> AdminInstructorLeaderboardItem.newBuilder()
                            .setInstructorId(stat.getInstructorId() == null ? "" : stat.getInstructorId())
                            .setStudentCount(stat.getStudentCount() == null ? 0L : stat.getStudentCount())
                            .setCourseCount(stat.getCourseCount() == null ? 0L : stat.getCourseCount())
                            .build())
                    .toList();

            responseObserver.onNext(GetAdminInstructorLeaderboardResponse.newBuilder().addAllItems(items).build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            responseObserver.onError(
                    Status.INTERNAL
                            .withDescription("Failed to load admin instructor leaderboard: " + e.getMessage())
                            .asRuntimeException()
            );
        }
    }

    @Override
    public void getAdminCourseModerationCounts(
            Empty request,
            StreamObserver<GetAdminCourseModerationCountsResponse> responseObserver
    ) {
        try {
            long pendingReviewCount = Optional
                    .ofNullable(courseRepo.countByStatusForAdmin(EnumCourseStatus.PENDING_REVIEW))
                    .orElse(0L);
            long rejectedCount = Optional
                    .ofNullable(courseRepo.countByStatusForAdmin(EnumCourseStatus.REJECTED))
                    .orElse(0L);

            GetAdminCourseModerationCountsResponse response = GetAdminCourseModerationCountsResponse.newBuilder()
                    .setPendingReviewCount(pendingReviewCount)
                    .setRejectedCount(rejectedCount)
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            responseObserver.onError(
                    Status.INTERNAL
                            .withDescription("Failed to load admin course moderation counts: " + e.getMessage())
                            .asRuntimeException()
            );
        }
    }

    @Override
    public void getTotalCoursesAndStudent(GetUserRequest request, StreamObserver<GetCourseAndStudentResponse> responseObserver) {
        try {
            List<CourseEntity> courseEntities = courseRepo.findAllByInstructorIdWithEnrollments(request.getId());
            List<String> coursesId = courseEntities.stream()
                    .map(CourseEntity::getId)
                    .filter(Objects::nonNull)
                    .toList();

            Set<String> completedCourseIds = new HashSet<>(
                    saleGrpcClient.getCompletedCourseIds(coursesId).getCourseIdsList()
            );

            Set<EnrollmentsEntity> enrollmentsEntities = new HashSet<>();
            for (CourseEntity course : courseEntities) {
                if (!completedCourseIds.contains(course.getId())) {
                    continue;
                }
                if (course.getEnrollments() != null) {
                    enrollmentsEntities.addAll(course.getEnrollments());
                }
            }

            GetCourseAndStudentResponse response = GetCourseAndStudentResponse.newBuilder()
                    .setTotalCourse(courseEntities.size())
                    .setTotalStudent(enrollmentsEntities.size())
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            responseObserver.onError(e);
        }
    }

    @Override
    public void getChartData(GetChartDataRequest request, StreamObserver<GetChartDataResponse> responseObserver) {
        try {
            long year = request.getYear();
            String userId = request.getUserId();
            System.out.println("1 ne");
            List<Object[]> raw = courseRepo.countEnrollmentsByMonth(userId, year);
            Map<Integer, Long> monthToEnrollmentCount = raw.stream()
                    .collect(Collectors.toMap(
                            row -> ((Integer) row[0]),   // month
                            row -> ((Long) row[1])       // count
                    ));

            List<String> coursesId = courseRepo.findAllIdsByInstructorId(userId);

            GetChartDataResponse.Builder response = GetChartDataResponse.newBuilder();
            response.setYear(String.valueOf(year));
            System.out.println("2 ne");

            // Gọi gRPC qua Sale (coursesId, year)

            // Response List(month, revenue, profit)
            GetRevenueAndProfitResponse saleServiceRes = saleGrpcClient.getRevenueAndProfit(coursesId , year);
            System.out.println("3 ne");

            // Tạo map tháng → revenue/profit
            Map<Integer, GetRevenueAndProfitList> monthToRevenueProfit = new HashMap<>();
            for (GetRevenueAndProfitList item : saleServiceRes.getDataListList()) {
                monthToRevenueProfit.put((int) item.getMonth(), item);
            }

            for (int month = 1; month <= 12; month++) {
                GetRevenueAndProfitList saleItem = monthToRevenueProfit.get(month);
                double revenue = saleItem != null ? saleItem.getRevenue() : 0L;
                double profit  = saleItem != null ? saleItem.getProfit()  : 0L;
                long enrollmentCount = monthToEnrollmentCount.getOrDefault(month, 0L);
                // Keep chart consistent with paid/completed flow: if no revenue, don't show student count.
                long studentCount = revenue > 0 ? enrollmentCount : 0L;

                MonthlyChartData monthly = MonthlyChartData.newBuilder()
                        .setMonth(month)
                        .setRevenue(revenue)
                        .setProfit(profit)
                        .setStudentCount(studentCount)
                        .build();

                response.addMonthlyData(monthly);
            }

            responseObserver.onNext(response.build());
            responseObserver.onCompleted();

        } catch (Exception e) {
            responseObserver.onError(e);
        }
    }

    @Override
    public void checkHasPurchased(HasPurchasedCourseRequest request, StreamObserver<HasPurchasedCourseResponse> responseObserver) {
        boolean result = enrollmentRepo.existsByUserIdAndCourse_Id(request.getUserId(), request.getCourseId());
        HasPurchasedCourseResponse response = HasPurchasedCourseResponse.newBuilder()
                .setHasPurchased(result)
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void updateCourseRating(UpdateCourseRatingRequest req,
                                   StreamObserver<UpdateCourseRatingResponse> resObs) {

        double roundedRating = BigDecimal.valueOf(req.getRating())
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();

        boolean success = courseRepo.findById(req.getCourseId())
                .map(course -> {
                    course.setRating(roundedRating);
                    courseRepo.save(course);
                    return true;
                })
                .orElse(false);

        resObs.onNext(UpdateCourseRatingResponse.newBuilder()
                .setIsSucces(success)
                .build());
        resObs.onCompleted();
    }

    @Override
    public void isInstructor(IsInstructorRequest request, StreamObserver<IsInstructorResponse> responseObserver) {
        boolean result = courseRepo
                .findByIdAndInstructorId(request.getCourseId(), request.getUserId())
                .isPresent();

        IsInstructorResponse response = IsInstructorResponse.newBuilder()
                .setIsInstructor(result)
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    // RCM v2: return course tags (topic)
    @Override
    public void getCourseTags(GetCourseTagsRequest request, StreamObserver<GetCourseTagsResponse> responseObserver) {
        try {
            String courseId = request.getCourseId();
            if (courseId == null || courseId.isBlank()) {
                responseObserver.onNext(GetCourseTagsResponse.newBuilder().build());
                responseObserver.onCompleted();
                return;
            }

            CourseEntity course = courseRepo.findByIdWithTags(courseId)
                    .orElseThrow(() -> new CustomExeption(ErrorCode.COURSE_NOT_FOUND));

            List<String> tags = Optional.ofNullable(course.getTags())
                    .orElseGet(Collections::emptyList)
                    .stream()
                    .map(TagEntity::getName)
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .distinct()
                    .toList();

            GetCourseTagsResponse response = GetCourseTagsResponse.newBuilder()
                    .addAllTags(tags)
                    .setCategory(course.getCategory() != null && course.getCategory().getName() != null
                        ? course.getCategory().getName()
                        : "")
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (CustomExeption e) {
            responseObserver.onError(
                    Status.NOT_FOUND
                            .withDescription(e.getMessage())
                            .asRuntimeException()
            );
        } catch (Exception e) {
            responseObserver.onError(
                    Status.INTERNAL
                            .withDescription("Failed to load course tags: " + e.getMessage())
                            .asRuntimeException()
            );
        }
    }

    @Override
    public void canEditLesson(CanEditLessonRequest request, StreamObserver<CanEditLessonResponse> resObs) {
        boolean result = false;
        try {
            result = lessonService.canEditLesson(request.getLessonId(), request.getInstructorId());
        } catch (Exception e) {
            // Return false if any issue or UNAUTHORIZED exception is thrown
            result = false;
        }

        CanEditLessonResponse response = CanEditLessonResponse.newBuilder()
                .setCanEdit(result)
                .build();

        resObs.onNext(response);
        resObs.onCompleted();
    }

    @Override
    public void canViewLesson(CanViewLessonRequest request, StreamObserver<CanViewLessonResponse> resObs) {
        boolean result = false;
        try {
            result = lessonStudentService.canViewLesson(request.getLessonId(), request.getUserId());
        } catch (Exception e) {
            // Return false if any issue or UNAUTHORIZED exception is thrown
            result = false;
        }

        CanViewLessonResponse response = CanViewLessonResponse.newBuilder()
                .setCanView(result)
                .build();

        resObs.onNext(response);
        resObs.onCompleted();
    }
}
