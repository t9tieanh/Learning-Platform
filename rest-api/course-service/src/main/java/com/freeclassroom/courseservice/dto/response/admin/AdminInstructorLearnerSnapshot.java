package com.freeclassroom.courseservice.dto.response.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminInstructorLearnerSnapshot {
    int year;
    Long totalStudentsInYear;
    Long newStudentsCurrentMonth;
    Double newStudentsTrendPercent;
}
