package com.freeclassroom.courseservice.dto.response.chapter;

import com.freeclassroom.courseservice.dto.response.course.LessonResponse;
import com.freeclassroom.courseservice.dto.response.lesson.LessonDto;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChapterUserResponse {
    String title;
    String description;
    Long position;
    Boolean isOpen;

    List<LessonDto> lessons;
}
