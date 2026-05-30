package com.freeclassroom.courseservice.dto.response.lesson;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MarkDoneLessonResponse {
    String id;

    @JsonProperty("isCompletedCourse")
    boolean completedCourse;

    String certificateId;

    String certificateCode;
}
