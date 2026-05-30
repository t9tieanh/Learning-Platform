package com.freeclassroom.courseservice.service.certificate;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.certificate.CertificateVerifyResponse;
import com.freeclassroom.courseservice.dto.response.certificate.CourseCompletionCertificateResponse;
import com.freeclassroom.courseservice.entity.member.EnrollmentsEntity;

import java.util.List;

public interface ICourseCompletionCertificateService {
    void issueIfEligible(EnrollmentsEntity enrollment);

    ApiResponse<List<CourseCompletionCertificateResponse>> getMyCertificates(String userId);

    ApiResponse<CourseCompletionCertificateResponse> getById(String id, String userId);

    ApiResponse<CertificateVerifyResponse> verifyByCode(String code);
}
