package com.freeclassroom.userservice.grpc.client;

import com.example.grpc.course.GetChartDataRequest;
import com.example.grpc.course.GetChartDataResponse;
import com.example.grpc.course.GetCourseAdminDataResponse;
import com.example.grpc.course.GetCourseAndStudentResponse;
import com.example.grpc.user.*;
import com.google.protobuf.Empty;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseGrpcClient {
    @GrpcClient("course-service")
    private CourseServiceGrpc.CourseServiceBlockingStub courseStub;

    public GetCourseAdminDataResponse getCourseAdminData() {
        return courseStub.getCourseAdminData(Empty.getDefaultInstance());
    }

    public GetCourseAndStudentResponse getTotalCoursesAndStudent(String userId) {
        GetUserRequest request = GetUserRequest.newBuilder()
                .setId(userId)
                .build();
        return courseStub.getTotalCoursesAndStudent(request);
    }

    public GetChartDataResponse getChartData(long year, String userId) {
        GetChartDataRequest request = GetChartDataRequest.newBuilder()
                .setYear(year)
                .setUserId(userId)
                .build();

        return courseStub.getChartData(request);
    }

}
