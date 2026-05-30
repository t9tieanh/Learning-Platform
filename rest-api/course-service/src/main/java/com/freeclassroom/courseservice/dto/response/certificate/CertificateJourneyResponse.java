package com.freeclassroom.courseservice.dto.response.certificate;

import lombok.*;
import lombok.experimental.FieldDefaults;

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
}
