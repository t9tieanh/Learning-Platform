package com.freeclassroom.userservice.dto.response.instructor;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChartDataResponse {
    String year;
    List<MonthlyChartData> monthlyData;
}
