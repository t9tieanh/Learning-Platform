package com.freeclassroom.courseservice.dto.certificate;

import com.freeclassroom.courseservice.entity.certificate.CourseCompletionCertificateEntity;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

import java.util.Optional;

@Getter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CertificateEligibilityTryResult {
    boolean newlyIssued;
    Optional<CourseCompletionCertificateEntity> certificate;
    CertificateEligibilityResult eligibility;
}
