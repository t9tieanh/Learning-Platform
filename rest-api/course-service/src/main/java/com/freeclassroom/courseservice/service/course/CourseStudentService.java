package com.freeclassroom.courseservice.service.course;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.certificate.CertificateJourneyResponse;
import com.freeclassroom.courseservice.dto.response.certificate.CertificateJourneyPendingTestResponse;
import com.freeclassroom.courseservice.dto.response.certificate.CertificateSummaryResponse;
import com.freeclassroom.courseservice.dto.certificate.CertificateEligibilityResult;
import com.freeclassroom.courseservice.dto.certificate.CertificatePendingLessonTestRef;
import com.freeclassroom.courseservice.service.certificate.CertificateEligibilityService;
import com.freeclassroom.courseservice.dto.response.course.student.LessonOverviewResponse;
import com.freeclassroom.courseservice.dto.response.course.student.CourseDetailResponse;
import com.freeclassroom.courseservice.dto.response.course.student.ChapterResponse;
import com.freeclassroom.courseservice.dto.response.user.InstructorResponse;
import com.freeclassroom.courseservice.entity.certificate.CourseCompletionCertificateEntity;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import com.freeclassroom.courseservice.entity.member.EnrollmentsEntity;
import com.freeclassroom.courseservice.enums.entity.EnumCourseStatus;
import com.freeclassroom.courseservice.enums.entity.EnumLessonProgress;
import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.exception.ErrorCode;
import com.freeclassroom.courseservice.mapper.CourseCompletionCertificateMapper;
import com.freeclassroom.courseservice.mapper.CourseStudentMapper;
import com.freeclassroom.courseservice.repository.entity.CourseCompletionCertificateRepository;
import com.freeclassroom.courseservice.repository.entity.CourseRepository;
import com.freeclassroom.courseservice.repository.entity.EnrollmentRepository;
import com.freeclassroom.courseservice.repository.entity.LessonRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
@Slf4j
public class CourseStudentService implements ICourseStudentService{
    EnrollmentRepository enrollmentRepo;
    CourseRepository courseRepo;
    CourseStudentMapper courseStudentMapper;
    LessonRepository lessonRepo;
    CourseCompletionCertificateRepository certificateRepository;
    CourseCompletionCertificateMapper certificateMapper;
    CertificateEligibilityService certificateEligibilityService;

    @Override
    public ApiResponse<CourseDetailResponse> getCourseChapter(String courseId, String userId) {
        EnrollmentsEntity enrollment = enrollmentRepo.findByUserIdAndCourse_Id(userId, courseId)
                .orElseThrow(() -> new CustomExeption(ErrorCode.UNAUTHORIZED));

        CourseEntity course = courseRepo.findById(courseId).orElseThrow(
                () -> new CustomExeption(ErrorCode.COURSE_NOT_FOUND)
        );

        // check status of course
        if (!course.getStatus().equals(EnumCourseStatus.PUBLISHED))
            throw new CustomExeption(ErrorCode.COURSE_NOT_PUBLISHED);

        CourseDetailResponse result = courseStudentMapper.toCourseDetailDto(course);

        InstructorResponse instructor = new InstructorResponse();
        instructor.setId(userId);

        result.setInstructor(instructor);
        //get data of lesson (include progress)
        result.getChapters().stream().forEach(chapter -> {
            chapter.setLessons(lessonRepo.findLessonOverviewWithProgressByChapter(chapter.getId(), enrollment.getId()));
        });

        result.setProgress(enrollment.getProgress());
        result.setCertificateJourney(buildCertificateJourney(enrollment, result));

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

    private CertificateJourneyResponse buildCertificateJourney(
            EnrollmentsEntity enrollment,
            CourseDetailResponse courseDetail
    ) {
        int totalLessons = courseDetail.getChapters().stream()
                .mapToInt(ch -> ch.getLessons() != null ? ch.getLessons().size() : 0)
                .sum();

        long completedLessons = courseDetail.getChapters().stream()
                .flatMap(ch -> ch.getLessons().stream())
                .filter(l -> EnumLessonProgress.COMPLETED.equals(l.getCompletionStatus()))
                .count();

        Double progress = enrollment.getProgress();
        double progressPercent = progress != null ? Math.round(progress * 1000.0) / 10.0 : 0.0;

        CourseCompletionCertificateEntity cert = certificateRepository
                .findByEnrollmentId(enrollment.getId())
                .orElse(null);

        CertificateSummaryResponse summary = cert != null ? certificateMapper.toSummary(cert) : null;

        java.util.List<String> lessonIds = courseDetail.getChapters().stream()
                .flatMap(ch -> ch.getLessons() != null ? ch.getLessons().stream() : java.util.stream.Stream.empty())
                .map(LessonOverviewResponse::getId)
                .toList();

        CertificateEligibilityResult eligibility = certificateEligibilityService.evaluate(enrollment, lessonIds);

        return CertificateJourneyResponse.builder()
                .completedLessons((int) completedLessons)
                .totalLessons(totalLessons)
                .progressPercent(progressPercent)
                .certificateIssued(cert != null)
                .certificate(summary)
                .lessonsWithTest(eligibility.getLessonsWithTest())
                .passedTests(eligibility.getPassedTests())
                .testProgressPercent(eligibility.getTestProgressPercent())
                .minPassPercent(eligibility.getMinPassPercent())
                .lessonsComplete(eligibility.isLessonsComplete())
                .testsComplete(eligibility.isTestsComplete())
                .eligibleForCertificate(eligibility.isEligible())
                .blockers(eligibility.getBlockers())
                .pendingLessonTests(buildPendingLessonTests(courseDetail, eligibility.getPendingLessonTests()))
                .build();
    }

    private List<CertificateJourneyPendingTestResponse> buildPendingLessonTests(
            CourseDetailResponse courseDetail,
            List<CertificatePendingLessonTestRef> pendingRefs
    ) {
        if (pendingRefs == null || pendingRefs.isEmpty()) {
            return List.of();
        }

        Map<String, LessonContext> lessonContextById = new HashMap<>();
        if (courseDetail.getChapters() != null) {
            for (ChapterResponse chapter : courseDetail.getChapters()) {
                if (chapter.getLessons() == null) {
                    continue;
                }
                for (LessonOverviewResponse lesson : chapter.getLessons()) {
                    lessonContextById.put(lesson.getId(), new LessonContext(
                            lesson,
                            chapter.getId(),
                            chapter.getTitle(),
                            chapter.getPosition()
                    ));
                }
            }
        }

        List<CertificateJourneyPendingTestResponse> pending = new ArrayList<>();
        for (CertificatePendingLessonTestRef ref : pendingRefs) {
            LessonContext context = lessonContextById.get(ref.getLessonId());
            String status = ref.isAttempted() ? "NOT_PASSED" : "NOT_ATTEMPTED";
            pending.add(CertificateJourneyPendingTestResponse.builder()
                    .lessonId(ref.getLessonId())
                    .lessonTitle(context != null ? context.lesson().getTitle() : null)
                    .chapterId(context != null ? context.chapterId() : null)
                    .chapterTitle(context != null ? context.chapterTitle() : null)
                    .chapterPosition(context != null ? context.chapterPosition() : null)
                    .lessonPosition(context != null ? context.lesson().getPosition() : null)
                    .bestPercent(ref.getBestPercent())
                    .attempted(ref.isAttempted())
                    .status(status)
                    .build());
        }

        pending.sort(Comparator
                .comparing(CertificateJourneyPendingTestResponse::getChapterPosition, Comparator.nullsLast(Long::compareTo))
                .thenComparing(CertificateJourneyPendingTestResponse::getLessonPosition, Comparator.nullsLast(Long::compareTo))
                .thenComparing(CertificateJourneyPendingTestResponse::getLessonTitle, Comparator.nullsLast(String::compareToIgnoreCase)));

        return pending;
    }

    private record LessonContext(
            LessonOverviewResponse lesson,
            String chapterId,
            String chapterTitle,
            Long chapterPosition
    ) {}
}
