package com.freeclassroom.userservice.service.instructor;

import com.example.grpc.course.GetChartDataResponse;
import com.example.grpc.course.GetCourseAndStudentResponse;
import com.example.grpc.course.TotalBlogResponse;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.instructor.ChartDataResponse;
import com.freeclassroom.userservice.dto.response.instructor.InstructorStatisticResponse;
import com.freeclassroom.userservice.dto.response.instructor.MonthlyChartData;
import com.freeclassroom.userservice.entity.user.UserEntity;
import com.freeclassroom.userservice.grpc.client.BlogGrpcClient;
import com.freeclassroom.userservice.grpc.client.CourseGrpcClient;
import com.freeclassroom.userservice.repository.entity.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InstructorService implements IInstructorService {
    UserRepository userRepo;
    BlogGrpcClient blogGrpc;
    CourseGrpcClient courseGrpc;
    @Override
    public ApiResponse<InstructorStatisticResponse> getInstructorStatistic(String userId) {
        try {
           TotalBlogResponse totalBlog = blogGrpc.getTotalInstructorBlog(userId);
           System.out.println("BLOGS: " + totalBlog.getTotal());
           GetCourseAndStudentResponse total = courseGrpc.getTotalCoursesAndStudent(userId);

           InstructorStatisticResponse response = new InstructorStatisticResponse();
           response.setTotalBlog(totalBlog.getTotal());
           response.setTotalCourse(total.getTotalCourse());
           response.setTotalStudent(total.getTotalStudent());

           return ApiResponse.<InstructorStatisticResponse>builder()
                    .code(HttpStatus.OK.value())
                    .message("Get data instructor statistic success")
                    .result(response)
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public ApiResponse<ChartDataResponse> getChartData(int year, String userId) {
        try {
            // gRPC Course
            GetChartDataResponse data = courseGrpc.getChartData(year, userId);

            ChartDataResponse res = new ChartDataResponse();
            res.setYear(data.getYear());

            // map monthlyData
            List<MonthlyChartData> monthlyList = data.getMonthlyDataList().stream()
                    .map(m -> {
                        MonthlyChartData dto = new MonthlyChartData();
                        dto.setMonth((int) m.getMonth());
                        dto.setRevenue(m.getRevenue());
                        dto.setProfit(m.getProfit());
                        dto.setStudentCount(m.getStudentCount());
                        return dto;
                    })
                    .collect(Collectors.toList());

            res.setMonthlyData(monthlyList);

            return ApiResponse.<ChartDataResponse>builder()
                    .code(HttpStatus.OK.value())
                    .message("Get chart data success")
                    .result(res)
                    .build();

        } catch (Exception e) {
            // Log lỗi
            e.printStackTrace();

            // Trả về ApiResponse lỗi
            return ApiResponse.<ChartDataResponse>builder()
                    .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Failed to get chart data: " + e.getMessage())
                    .result(null)
                    .build();
        }
    }
}
