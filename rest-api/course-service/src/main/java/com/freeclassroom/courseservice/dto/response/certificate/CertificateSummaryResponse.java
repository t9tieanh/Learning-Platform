package com.freeclassroom.courseservice.dto.response.certificate;

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
public class CertificateSummaryResponse {
    String id;
    String certificateCode;
    LocalDateTime issuedAt;
    EnumCertificateStatus status;
}
