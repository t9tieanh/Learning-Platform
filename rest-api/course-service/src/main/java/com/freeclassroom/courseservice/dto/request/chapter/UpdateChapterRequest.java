package com.freeclassroom.courseservice.dto.request.chapter;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateChapterRequest {
    String title;
    Long position;
    String description;
}
