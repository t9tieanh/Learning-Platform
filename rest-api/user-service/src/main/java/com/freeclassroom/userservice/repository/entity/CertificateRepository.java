package com.freeclassroom.userservice.repository.entity;

import com.freeclassroom.userservice.entity.certificate.Certificate;
import com.freeclassroom.userservice.enums.CertificateStatus;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CertificateRepository extends JpaRepository<Certificate, String> {
    List<Certificate> findAllByUserId(String userId);

    @Query("SELECT c FROM Certificate c WHERE c.status = :status")
    List<Certificate> findCertificatePending(@Param("status") CertificateStatus status);

    @Query("SELECT c FROM Certificate c WHERE c.userId = :userId AND c.status = com.freeclassroom.userservice.enums.CertificateStatus.CONFIRMED")
    List<Certificate> findConfirmedCertificatesByUserId(@Param("userId") String userId);
}
