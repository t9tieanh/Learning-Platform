package com.freeclassroom.courseservice.dto.response.certificate;

import com.freeclassroom.courseservice.dto.snapshot.CourseSnapshot;
import com.freeclassroom.courseservice.dto.snapshot.RecipientSnapshot;
import com.freeclassroom.courseservice.enums.entity.EnumCertificateStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseCompletionCertificateResponse {
    String id;
    String certificateCode;
    LocalDateTime issuedAt;
    LocalDateTime completedAt;
    EnumCertificateStatus status;
    RecipientSnapshot recipientSnapshot;
    CourseSnapshot courseSnapshot;
}
