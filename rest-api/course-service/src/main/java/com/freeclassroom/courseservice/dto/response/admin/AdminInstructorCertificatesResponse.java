package com.freeclassroom.courseservice.dto.response.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminInstructorCertificatesResponse {
    Long totalCertificates;
    List<CertificateItem> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class CertificateItem {
        String id;
        String title;
        String organization;
        String issueDate;
        String imageUrl;
    }
}
