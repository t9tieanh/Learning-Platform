package com.freeclassroom.courseservice.dto.response.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GetDataInstructorResponse {
    Long instructorQuantity;
    String instructorName;
    String instructorEmail;
    Long totalCourse;
}
