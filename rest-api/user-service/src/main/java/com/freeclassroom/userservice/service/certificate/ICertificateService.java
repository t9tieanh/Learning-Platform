package com.freeclassroom.userservice.service.certificate;

import com.freeclassroom.userservice.dto.request.certificates.CreateCertReq;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.certificate.CertificateResponse;

import java.util.List;

public interface ICertificateService {
    ApiResponse<CertificateResponse> createCertificate(CreateCertReq req, String userId);
    ApiResponse<List<CertificateResponse>> getCertificates(String userId);
    ApiResponse<Boolean> deleteCertificate(String id);
    ApiResponse<List<CertificateResponse>> adminGetCertificates();
    ApiResponse<Boolean> updateCertificate(String id, String reason, String status);
}
