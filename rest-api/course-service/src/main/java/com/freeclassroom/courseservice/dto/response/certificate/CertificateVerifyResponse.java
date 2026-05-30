package com.freeclassroom.courseservice.dto.response.certificate;

import com.freeclassroom.courseservice.dto.snapshot.CourseSnapshot;
import com.freeclassroom.courseservice.dto.snapshot.RecipientSnapshot;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CertificateVerifyResponse {
    boolean valid;
    String certificateCode;
    LocalDateTime issuedAt;
    RecipientSnapshot recipientSnapshot;
    CourseSnapshot courseSnapshot;
}
