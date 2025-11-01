package com.freeclassroom.courseservice.dto.response.course.student;

import com.freeclassroom.courseservice.enums.entity.EnumLessonType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LessonOverviewResponse {
    String id;
    String title;
    String content;
    Long duration;
    Long position;

    @Enumerated(EnumType.STRING)
    EnumLessonType type;
}
