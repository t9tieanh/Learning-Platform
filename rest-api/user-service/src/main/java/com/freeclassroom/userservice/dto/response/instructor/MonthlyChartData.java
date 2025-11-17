package com.freeclassroom.userservice.dto.response.instructor;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MonthlyChartData {
    int month;
    double revenue;
    double profit;
    long studentCount;
}
