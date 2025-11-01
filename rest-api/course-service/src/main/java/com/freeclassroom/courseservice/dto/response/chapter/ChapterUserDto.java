package com.freeclassroom.courseservice.dto.response.chapter;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChapterUserDto {
    String id;
    String title;
    String description;
    Long position;
    Boolean isOpen;

    // addition
    Long lessonNum;
    Double duration;
}
