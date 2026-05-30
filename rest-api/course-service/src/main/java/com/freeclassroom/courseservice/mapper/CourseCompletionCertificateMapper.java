package com.freeclassroom.courseservice.mapper;

import com.freeclassroom.courseservice.dto.response.certificate.CertificateSummaryResponse;
import com.freeclassroom.courseservice.dto.response.certificate.CourseCompletionCertificateResponse;
import com.freeclassroom.courseservice.entity.certificate.CourseCompletionCertificateEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CourseCompletionCertificateMapper {
    CourseCompletionCertificateResponse toDto(CourseCompletionCertificateEntity entity);

    CertificateSummaryResponse toSummary(CourseCompletionCertificateEntity entity);
}
