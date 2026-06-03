package com.freeclassroom.courseservice.dto.certificate;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CertificateEligibilityResult {
    boolean lessonsComplete;
    boolean testsComplete;
    boolean eligible;
    int lessonsWithTest;
    int passedTests;
    double testProgressPercent;
    double minPassPercent;
    List<String> blockers;
    List<CertificatePendingLessonTestRef> pendingLessonTests;
}
