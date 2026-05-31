package com.freeclassroom.courseservice.dto.certificate;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CertificatePendingLessonTestRef {
    String lessonId;
    double bestPercent;
    boolean attempted;
}
