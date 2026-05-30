package com.freeclassroom.courseservice.dto.certificate;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CertificatePdfModel {
    String recipientName;
    String courseTitle;
    String instructorName;
    String certificateCode;
    String issuedAtFormatted;
    String verifyUrl;
    String logoDataUri;
    String courseThumbnailDataUri;
    String instructorAvatarDataUri;
    boolean hasCourseThumbnail;
    boolean hasInstructorAvatar;
}
