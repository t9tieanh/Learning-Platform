package com.freeclassroom.courseservice.dto.response.certificate;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CertificateJourneyPendingTestResponse {
    String lessonId;
    String lessonTitle;
    String chapterId;
    String chapterTitle;
    Long chapterPosition;
    Long lessonPosition;
    /** {@code -1} when the student has not submitted any attempt. */
    double bestPercent;
    boolean attempted;
    /** {@code NOT_ATTEMPTED} or {@code NOT_PASSED}. */
    String status;
}
