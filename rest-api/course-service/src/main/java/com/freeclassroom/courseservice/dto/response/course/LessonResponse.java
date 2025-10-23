package com.freeclassroom.courseservice.dto.response.course;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LessonResponse {
    String title;
    String content;
    Long duration;
    Long position;
    Boolean isPublic;

    List<ResourceResponse> resources;
}
