package com.freeclassroom.courseservice.dto.response.member;

import com.freeclassroom.courseservice.enums.entity.EnumCompletionStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EnrollmentResponse {
    String userId;
    LocalDateTime enrollmentDate;
    EnumCompletionStatus status;
    Double progress;
}
