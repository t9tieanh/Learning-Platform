package com.freeclassroom.userservice.dto.request.certificates;

import com.freeclassroom.userservice.enums.CertificateStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateCertReq {
    String title;
    String organization;
    String credentialUrl;
    String imageUrl;
    String issueDate;
    String reason;
    CertificateStatus status;
}
