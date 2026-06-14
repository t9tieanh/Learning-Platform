package com.freeclassroom.courseservice.service.certificate;

import com.example.grpc.assistant.LessonTestEligibilityItem;
import com.freeclassroom.courseservice.configuration.CertificateProperties;
import com.freeclassroom.courseservice.dto.certificate.CertificateEligibilityResult;
import com.freeclassroom.courseservice.dto.certificate.CertificateEligibilityTryResult;
import com.freeclassroom.courseservice.dto.certificate.CertificatePendingLessonTestRef;
import com.freeclassroom.courseservice.dto.certificate.CourseScoreSummary;
import com.freeclassroom.courseservice.entity.certificate.CourseCompletionCertificateEntity;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import com.freeclassroom.courseservice.entity.member.EnrollmentsEntity;
import com.freeclassroom.courseservice.enums.entity.EnumCourseStatus;
import com.freeclassroom.courseservice.grpc.client.AssistantGrpcClient;
import com.freeclassroom.courseservice.repository.entity.CourseCompletionCertificateRepository;
import com.freeclassroom.courseservice.repository.entity.EnrollmentRepository;
import com.freeclassroom.courseservice.repository.entity.LessonRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CertificateEligibilityService {

    AssistantGrpcClient assistantGrpcClient;
    CertificateProperties certificateProperties;
    CourseCompletionCertificateService courseCompletionCertificateService;
    CourseCompletionCertificateRepository certificateRepository;
    EnrollmentRepository enrollmentRepository;
    LessonRepository lessonRepository;
    CertificateIssuedNotificationService certificateIssuedNotificationService;

    public CertificateEligibilityResult evaluate(EnrollmentsEntity enrollment) {
        CourseEntity course = enrollment.getCourse();
        if (course == null || course.getId() == null) {
            return evaluate(enrollment, List.of());
        }
        return evaluate(enrollment, lessonRepository.findIdsByCourseId(course.getId()));
    }

    public CertificateEligibilityResult evaluate(EnrollmentsEntity enrollment, List<String> lessonIds) {
        double minPassPercent = certificateProperties.getMinQuizPassPercent();
        boolean lessonsComplete = isLessonsComplete(enrollment);
        CourseEntity course = enrollment.getCourse();

        List<LessonTestEligibilityItem> testItems = assistantGrpcClient.batchGetLessonTestEligibility(
                enrollment.getUserId(),
                lessonIds,
                minPassPercent
        );

        int lessonsWithTest = 0;
        int passedTests = 0;
        int pendingTests = 0;
        List<CertificatePendingLessonTestRef> pendingLessonTests = new ArrayList<>();

        for (LessonTestEligibilityItem item : testItems) {
            if (!item.getHasPublishedTest()) {
                continue;
            }
            lessonsWithTest++;
            if (item.getPassed()) {
                passedTests++;
            } else {
                pendingTests++;
                double bestPercent = item.getBestPercent();
                boolean attempted = bestPercent >= 0;
                pendingLessonTests.add(CertificatePendingLessonTestRef.builder()
                        .lessonId(item.getLessonId())
                        .bestPercent(attempted ? bestPercent : -1)
                        .attempted(attempted)
                        .build());
            }
        }

        boolean testsComplete = pendingTests == 0;
        boolean coursePublished = course != null && EnumCourseStatus.PUBLISHED.equals(course.getStatus());
        boolean alreadyIssued = certificateRepository.existsByEnrollmentId(enrollment.getId());

        boolean eligibleForCertificate = alreadyIssued
                || (lessonsComplete && testsComplete && coursePublished);

        double testProgressPercent = lessonsWithTest > 0
                ? Math.round((passedTests * 1000.0) / lessonsWithTest) / 10.0
                : 100.0;

        CourseScoreSummary scoreSummary = computeCourseScoreSummary(testItems);

        int courseScore = scoreSummary.getEarned();
        int courseScoreTotal = scoreSummary.getTotal();

        List<String> blockers = buildBlockers(lessonsComplete, testsComplete, pendingTests, lessonsWithTest, passedTests, minPassPercent, alreadyIssued);

        return CertificateEligibilityResult.builder()
                .lessonsComplete(lessonsComplete)
                .testsComplete(testsComplete)
                .eligible(eligibleForCertificate)
                .lessonsWithTest(lessonsWithTest)
                .passedTests(passedTests)
                .testProgressPercent(testProgressPercent)
                .minPassPercent(minPassPercent)
                .courseScore(courseScore)
                .courseScoreTotal(courseScoreTotal)
                .blockers(blockers)
                .pendingLessonTests(pendingLessonTests)
                .build();
    }

    @Transactional
    public CertificateEligibilityTryResult tryIssue(EnrollmentsEntity enrollment) {
        EnrollmentsEntity managedEnrollment = enrollmentRepository.findByIdWithCourse(enrollment.getId())
                .orElseThrow(() -> new IllegalStateException("Enrollment not found: " + enrollment.getId()));

        CertificateEligibilityResult eligibility = evaluate(managedEnrollment);

        if (certificateRepository.existsByEnrollmentId(managedEnrollment.getId())) {
            Optional<CourseCompletionCertificateEntity> existing =
                    certificateRepository.findByEnrollmentId(managedEnrollment.getId());
            return CertificateEligibilityTryResult.builder()
                    .newlyIssued(false)
                    .certificate(existing)
                    .eligibility(eligibility)
                    .build();
        }

        if (!eligibility.isLessonsComplete() || !eligibility.isTestsComplete()) {
            return CertificateEligibilityTryResult.builder()
                    .newlyIssued(false)
                    .certificate(Optional.empty())
                    .eligibility(eligibility)
                    .build();
        }

        Optional<CourseCompletionCertificateEntity> issued =
                courseCompletionCertificateService.issueCertificate(
                        managedEnrollment,
                        new CourseScoreSummary(eligibility.getCourseScore(), eligibility.getCourseScoreTotal())
                );

        issued.ifPresent(cert -> TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        certificateIssuedNotificationService.publish(cert, managedEnrollment);
                    }
                }
        ));

        return CertificateEligibilityTryResult.builder()
                .newlyIssued(issued.isPresent())
                .certificate(issued)
                .eligibility(eligibility)
                .build();
    }

    private boolean isLessonsComplete(EnrollmentsEntity enrollment) {
        Double progress = enrollment.getProgress();
        return progress != null && progress >= 1.0;
    }

    /** Sum of best earned / max points across published lesson tests; 10/10 when the course has no tests. */
    static CourseScoreSummary computeCourseScoreSummary(List<LessonTestEligibilityItem> testItems) {
        int totalEarned = 0;
        int totalMax = 0;
        int lessonsWithTest = 0;
        for (LessonTestEligibilityItem item : testItems) {
            if (!item.getHasPublishedTest()) {
                continue;
            }
            lessonsWithTest++;
            totalEarned += (int) Math.round(item.getBestEarnedPoints());
            totalMax += item.getMaxPoints();
        }
        return lessonsWithTest > 0 ? new CourseScoreSummary(totalEarned, totalMax) : CourseScoreSummary.noTestsDefault();
    }

    private List<String> buildBlockers(
            boolean lessonsComplete,
            boolean testsComplete,
            int pendingTests,
            int lessonsWithTest,
            int passedTests,
            double minPassPercent,
            boolean alreadyIssued
    ) {
        if (alreadyIssued) {
            return List.of();
        }

        List<String> blockers = new ArrayList<>();
        if (!lessonsComplete) {
            blockers.add("Hoàn thành tất cả bài học trong khóa");
        }
        if (!testsComplete && lessonsWithTest > 0) {
            blockers.add(String.format(
                    "Còn %d/%d bài kiểm tra chưa đạt %.0f%% (%d/%d đã pass)",
                    pendingTests,
                    lessonsWithTest,
                    minPassPercent,
                    passedTests,
                    lessonsWithTest
            ));
        }
        return blockers;
    }
}
