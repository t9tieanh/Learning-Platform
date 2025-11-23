package com.freeclassroom.courseservice.mapper;

import com.example.grpc.user.Certificate;
import com.freeclassroom.courseservice.dto.response.course.CertificateResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CertificateMapper {
    CertificateResponse toResponse(Certificate grpcCertificate);
}
