package com.freeclassroom.userservice.dto.response.classroom.post;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ExerciseCreationResponse {
    String title;

    LocalDate beginDate;
    LocalDate endDate;
}
