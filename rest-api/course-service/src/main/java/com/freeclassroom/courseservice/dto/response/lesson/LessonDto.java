package com.freeclassroom.courseservice.dto.response.lesson;

import com.freeclassroom.courseservice.enums.entity.EnumLessonType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LessonDto {
    String title;
    String content;
    Long duration;
    Long position;
    Boolean isPublic;

    @Enumerated(EnumType.STRING)
    EnumLessonType type;
    String url;
}
