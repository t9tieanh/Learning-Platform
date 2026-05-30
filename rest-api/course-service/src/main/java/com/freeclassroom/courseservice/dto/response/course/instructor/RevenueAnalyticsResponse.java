package com.freeclassroom.courseservice.dto.response.course.instructor;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RevenueAnalyticsResponse {
    String instructorId;
    int year;
    double totalRevenueInYear;
    double totalProfitInYear;
    double revenueTrendPercent;
    double profitTrendPercent;
    HighestRevenueMonth highestRevenueMonth;
    List<MonthlyRevenueItem> monthlyRevenue;
    List<TopCourseRevenueItem> topCoursesByRevenue;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class HighestRevenueMonth {
        int month;
        double revenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class MonthlyRevenueItem {
        int month;
        double revenue;
        double profit;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class TopCourseRevenueItem {
        String courseId;
        String courseTitle;
        double revenue;
    }
}
