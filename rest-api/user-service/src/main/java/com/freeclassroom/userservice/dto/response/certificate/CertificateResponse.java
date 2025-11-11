package com.freeclassroom.userservice.dto.response.certificate;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CertificateResponse {
    String id;
    String title;
    String organization;
    String credentialUrl;
    String imageUrl;
    String issueDate;
}
