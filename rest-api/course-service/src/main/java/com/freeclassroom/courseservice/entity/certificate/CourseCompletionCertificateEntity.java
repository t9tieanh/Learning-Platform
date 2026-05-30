package com.freeclassroom.courseservice.entity.certificate;

import com.freeclassroom.courseservice.dto.snapshot.CourseSnapshot;
import com.freeclassroom.courseservice.dto.snapshot.RecipientSnapshot;
import com.freeclassroom.courseservice.entity.AbstractEntity;
import com.freeclassroom.courseservice.enums.entity.EnumCertificateStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "course_completion_certificates")
@AllArgsConstructor
@NoArgsConstructor(force = true)
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseCompletionCertificateEntity extends AbstractEntity {

    @Column(name = "enrollment_id", nullable = false, unique = true)
    String enrollmentId;

    @Column(name = "certificate_code", nullable = false, unique = true)
    String certificateCode;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "recipient_snapshot", columnDefinition = "json")
    RecipientSnapshot recipientSnapshot;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "course_snapshot", columnDefinition = "json")
    CourseSnapshot courseSnapshot;

    LocalDateTime issuedAt;

    LocalDateTime completedAt;

    @Enumerated(EnumType.STRING)
    EnumCertificateStatus status;
}
