package com.freeclassroom.userservice.dto.response.classroom;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SectionCreationResponse {
    String title;
    LocalDate createDate;
}
