package com.freeclassroom.courseservice.dto.response.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminInstructorSummaryResponse {
    AdminInstructorProfileResponse profile;
    AdminInstructorMetricsResponse metrics;
    AdminInstructorLearnerSnapshot learnersSnapshot;
    AdminInstructorRevenueSnapshot revenueSnapshot;
    AdminInstructorCertificatesResponse personalCertificates;
}
