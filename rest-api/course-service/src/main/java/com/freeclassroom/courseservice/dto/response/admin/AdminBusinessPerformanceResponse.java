package com.freeclassroom.courseservice.dto.response.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminBusinessPerformanceResponse {
    String range;
    List<Point> points;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Point {
        String label;
        String bucketKey;
        LocalDate startDate;
        LocalDate endDate;
        double revenue;
        long studentCount;
    }
}
