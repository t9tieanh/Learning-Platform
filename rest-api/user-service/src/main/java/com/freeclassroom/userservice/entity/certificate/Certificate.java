package com.freeclassroom.userservice.entity.certificate;

import com.freeclassroom.userservice.entity.AbstractEntity;
import com.freeclassroom.userservice.enums.CertificateStatus;
import com.freeclassroom.userservice.enums.entity.EnumAccountStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor(force = true)
@Data
@SuperBuilder
@Table(name = "certificates")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Certificate extends AbstractEntity {
    String userId;
    String title;
    String organization;
    LocalDate issueDate;

    @Column(unique = true, nullable = false)
    String credentialUrl;
    String imageUrl;
    boolean verified = false;
    String verificationSource;
    String verifyNote;
    LocalDateTime verifiedAt;
    String reason;
    CertificateStatus status;
}
