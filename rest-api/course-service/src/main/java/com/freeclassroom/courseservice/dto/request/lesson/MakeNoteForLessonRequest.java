package com.freeclassroom.courseservice.dto.request.lesson;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MakeNoteForLessonRequest {
    String content;
}
