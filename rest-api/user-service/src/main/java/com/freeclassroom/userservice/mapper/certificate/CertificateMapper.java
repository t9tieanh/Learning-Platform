package com.freeclassroom.userservice.mapper.certificate;

import com.freeclassroom.userservice.dto.request.certificates.CreateCertReq;
import com.freeclassroom.userservice.dto.response.certificate.CertificateResponse;
import com.freeclassroom.userservice.dto.response.user.GetUserResponse;
import com.freeclassroom.userservice.entity.certificate.Certificate;
import com.freeclassroom.userservice.entity.redis.PendingUserEntity;
import com.freeclassroom.userservice.entity.user.UserEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CertificateMapper {
    Certificate toEntity(CreateCertReq req);
    CertificateResponse toDto(Certificate entity);
    com.example.grpc.user.Certificate toGrpc(Certificate entity);
}
