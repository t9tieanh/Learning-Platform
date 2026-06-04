package com.freeclassroom.courseservice.dto.response.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminInstructorRevenueSnapshot {
    int year;
    Double totalRevenueInYear;
    Double totalProfitInYear;
    Integer highestRevenueMonth;
    Double highestRevenueAmount;
    List<MonthlyRevenuePoint> monthlyRevenue;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class MonthlyRevenuePoint {
        Integer month;
        Double revenue;
        Double profit;
    }
}
