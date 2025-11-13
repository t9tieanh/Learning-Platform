package com.freeclassroom.userservice.dto.response.certificate;

import com.freeclassroom.userservice.enums.CertificateStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminCertificateResponse {
    String id;
    String title;
    String organization;
    String credentialUrl;
    String imageUrl;
    String issueDate;
    String reason;
    CertificateStatus status;
    String userId;
}
