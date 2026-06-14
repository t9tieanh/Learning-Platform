package com.freeclassroom.courseservice.dto.event;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CertificateIssuedEvent {
    String userId;
    String userName;
    String email;
    String courseId;
    String courseTitle;
    String courseThumbnailUrl;
    String certificateId;
    String certificateCode;
    Integer courseScore;
    Integer courseScoreTotal;
    String profileUrl;
    String courseUrl;
    String certificatePdfBase64;
    String certificatePdfFilename;
}
