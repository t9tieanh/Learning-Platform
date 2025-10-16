package com.freeclassroom.courseservice.dto.response.chapter;

import com.freeclassroom.courseservice.entity.course.LessonEntity;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChapterDto {
    String id;
    String title;
    String description;
    Long position;
    Boolean isOpen;

    List<LessonEntity> lessons;
}
