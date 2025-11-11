package com.freeclassroom.userservice.repository.entity;

import com.freeclassroom.userservice.entity.certificate.Certificate;
import com.freeclassroom.userservice.entity.user.ExpertiseEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CertificateRepository extends JpaRepository<Certificate, String> {
    List<Certificate> findAllByUserId(String userId);
}
