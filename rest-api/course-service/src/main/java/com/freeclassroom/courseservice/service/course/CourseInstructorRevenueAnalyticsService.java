package com.freeclassroom.courseservice.service.course;

import com.example.grpc.user.GetRevenueAndProfitList;
import com.example.grpc.user.GetRevenueAndProfitResponse;
import com.example.grpc.user.GetTopCoursesRevenueResponse;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.course.instructor.RevenueAnalyticsResponse;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.exception.ErrorCode;
import com.freeclassroom.courseservice.grpc.client.SaleGrpcClient;
import com.freeclassroom.courseservice.repository.entity.CourseRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CourseInstructorRevenueAnalyticsService implements ICourseInstructorRevenueAnalyticsService {
    CourseRepository courseRepository;
    SaleGrpcClient saleGrpcClient;

    @Override
    public ApiResponse<RevenueAnalyticsResponse> getRevenueAnalytics(String instructorId, int year) {
        if (instructorId == null || instructorId.isBlank()) {
            throw new CustomExeption(ErrorCode.INVALID_KEY);
        }
        if (year < 2000 || year > 2100) {
            throw new CustomExeption(ErrorCode.INVALID_KEY);
        }

        List<CourseEntity> instructorCourses = courseRepository.findAllByInstructorId(instructorId);
        List<String> courseIds = instructorCourses.stream().map(CourseEntity::getId).toList();
        Map<String, String> courseNameById = instructorCourses.stream()
                .collect(Collectors.toMap(CourseEntity::getId, CourseEntity::getTitle, (a, b) -> a));

        GetRevenueAndProfitResponse monthlyRaw = saleGrpcClient.getRevenueAndProfit(courseIds, year);
        GetTopCoursesRevenueResponse topRaw = saleGrpcClient.getTopCoursesRevenue(courseIds, year, 5);

        Map<Integer, GetRevenueAndProfitList> monthMap = new HashMap<>();
        for (GetRevenueAndProfitList item : monthlyRaw.getDataListList()) {
            monthMap.put((int) item.getMonth(), item);
        }

        List<RevenueAnalyticsResponse.MonthlyRevenueItem> monthly = new ArrayList<>();
        double totalRevenue = 0D;
        double totalProfit = 0D;

        double maxRevenue = -1D;
        int maxMonth = 1;

        for (int month = 1; month <= 12; month++) {
            GetRevenueAndProfitList source = monthMap.get(month);
            double revenue = source != null ? source.getRevenue() : 0D;
            double profit = source != null ? source.getProfit() : 0D;

            totalRevenue += revenue;
            totalProfit += profit;

            if (revenue > maxRevenue) {
                maxRevenue = revenue;
                maxMonth = month;
            }

            monthly.add(RevenueAnalyticsResponse.MonthlyRevenueItem.builder()
                    .month(month)
                    .revenue(round2(revenue))
                    .profit(round2(profit))
                    .build());
        }

        int currentMonth = year == LocalDate.now().getYear() ? LocalDate.now().getMonthValue() : 12;
        double currentRevenue = monthly.get(currentMonth - 1).getRevenue();
        double currentProfit = monthly.get(currentMonth - 1).getProfit();
        double previousRevenue = currentMonth > 1 ? monthly.get(currentMonth - 2).getRevenue() : 0D;
        double previousProfit = currentMonth > 1 ? monthly.get(currentMonth - 2).getProfit() : 0D;

        List<RevenueAnalyticsResponse.TopCourseRevenueItem> topCourses = topRaw.getItemsList().stream()
                .map(item -> RevenueAnalyticsResponse.TopCourseRevenueItem.builder()
                        .courseId(item.getCourseId())
                        .courseTitle(courseNameById.getOrDefault(item.getCourseId(), "Khóa học"))
                        .revenue(round2(item.getRevenue()))
                        .build())
                .toList();

        RevenueAnalyticsResponse result = RevenueAnalyticsResponse.builder()
                .instructorId(instructorId)
                .year(year)
                .totalRevenueInYear(round2(totalRevenue))
                .totalProfitInYear(round2(totalProfit))
                .revenueTrendPercent(calcTrend(currentRevenue, previousRevenue))
                .profitTrendPercent(calcTrend(currentProfit, previousProfit))
                .highestRevenueMonth(RevenueAnalyticsResponse.HighestRevenueMonth.builder()
                        .month(maxMonth)
                        .revenue(round2(Math.max(maxRevenue, 0D)))
                        .build())
                .monthlyRevenue(monthly)
                .topCoursesByRevenue(topCourses)
                .build();

        return ApiResponse.<RevenueAnalyticsResponse>builder()
                .code(200)
                .message("Get revenue analytics success")
                .result(result)
                .build();
    }

    private double calcTrend(double current, double previous) {
        if (previous == 0D) {
            return current == 0D ? 0D : 100D;
        }
        return round2(((current - previous) / previous) * 100D);
    }

    private double round2(double value) {
        return Math.round(value * 100D) / 100D;
    }
}
