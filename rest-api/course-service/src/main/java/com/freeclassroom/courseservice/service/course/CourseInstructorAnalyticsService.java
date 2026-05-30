package com.freeclassroom.courseservice.service.course;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.course.instructor.LearnerAnalyticsResponse;
import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.exception.ErrorCode;
import com.freeclassroom.courseservice.repository.entity.CourseRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CourseInstructorAnalyticsService implements ICourseInstructorAnalyticsService {
    CourseRepository courseRepository;

    @Override
    public ApiResponse<LearnerAnalyticsResponse> getLearnerAnalytics(String instructorId, int year) {
        if (instructorId == null || instructorId.isBlank()) {
            throw new CustomExeption(ErrorCode.INVALID_KEY);
        }
        if (year < 2000 || year > 2100) {
            throw new CustomExeption(ErrorCode.INVALID_KEY);
        }

        List<Object[]> raw = courseRepository.countEnrollmentsByMonthForInstructor(instructorId, year);
        Map<Integer, Long> monthlyMap = raw.stream().collect(Collectors.toMap(
                row -> ((Integer) row[0]),
                row -> ((Long) row[1])
        ));

        List<LearnerAnalyticsResponse.MonthlyLearnerItem> monthly = new ArrayList<>();
        long totalStudentsInYear = 0L;

        for (int month = 1; month <= 12; month++) {
            long studentCount = monthlyMap.getOrDefault(month, 0L);
            totalStudentsInYear += studentCount;
            monthly.add(LearnerAnalyticsResponse.MonthlyLearnerItem.builder()
                    .month(month)
                    .studentCount(studentCount)
                    .build());
        }

        int currentMonth = year == Year.now().getValue() ? LocalDate.now().getMonthValue() : 12;
        long current = monthly.get(currentMonth - 1).getStudentCount();
        long previous = currentMonth > 1 ? monthly.get(currentMonth - 2).getStudentCount() : 0L;

        double trendPercent;
        if (previous == 0) {
            trendPercent = current == 0 ? 0D : 100D;
        } else {
            trendPercent = ((double) (current - previous) / previous) * 100D;
        }

        LearnerAnalyticsResponse result = LearnerAnalyticsResponse.builder()
                .instructorId(instructorId)
                .year(year)
                .totalStudentsInYear(totalStudentsInYear)
                .newStudentsCurrentMonth(current)
                .newStudentsTrendPercent(trendPercent)
                .monthlyStudents(monthly)
                .build();

        return ApiResponse.<LearnerAnalyticsResponse>builder()
                .code(200)
                .message("Get learner analytics success")
                .result(result)
                .build();
    }
}
