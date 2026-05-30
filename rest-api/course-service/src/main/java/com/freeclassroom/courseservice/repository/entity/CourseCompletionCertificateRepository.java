package com.freeclassroom.courseservice.repository.entity;

import com.freeclassroom.courseservice.entity.certificate.CourseCompletionCertificateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseCompletionCertificateRepository extends JpaRepository<CourseCompletionCertificateEntity, String> {

    Optional<CourseCompletionCertificateEntity> findByEnrollmentId(String enrollmentId);

    Optional<CourseCompletionCertificateEntity> findByCertificateCode(String certificateCode);

    boolean existsByEnrollmentId(String enrollmentId);

    @Query("""
            SELECT c FROM CourseCompletionCertificateEntity c
            WHERE c.enrollmentId IN (
                SELECT e.id FROM EnrollmentsEntity e WHERE e.userId = :userId
            )
            ORDER BY c.issuedAt DESC
            """)
    List<CourseCompletionCertificateEntity> findByUserIdOrderByIssuedAtDesc(@Param("userId") String userId);

    @Query("""
            SELECT c FROM CourseCompletionCertificateEntity c
            WHERE c.id = :id
            AND c.enrollmentId IN (
                SELECT e.id FROM EnrollmentsEntity e WHERE e.userId = :userId
            )
            """)
    Optional<CourseCompletionCertificateEntity> findByIdAndUserId(
            @Param("id") String id,
            @Param("userId") String userId
    );
}
