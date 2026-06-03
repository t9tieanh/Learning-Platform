package com.freeclassroom.courseservice.dto.response.certificate;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CertificateJourneyResponse {
    int completedLessons;
    int totalLessons;
    double progressPercent;
    boolean certificateIssued;
    CertificateSummaryResponse certificate;

    int lessonsWithTest;
    int passedTests;
    double testProgressPercent;
    double minPassPercent;
    boolean lessonsComplete;
    boolean testsComplete;
    boolean eligibleForCertificate;
    List<String> blockers;
    List<CertificateJourneyPendingTestResponse> pendingLessonTests;
}
