package com.freeclassroom.courseservice.dto.response.course.instructor;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LearnerAnalyticsResponse {
    String instructorId;
    int year;
    long totalStudentsInYear;
    long newStudentsCurrentMonth;
    double newStudentsTrendPercent;
    List<MonthlyLearnerItem> monthlyStudents;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class MonthlyLearnerItem {
        int month;
        long studentCount;
    }
}
