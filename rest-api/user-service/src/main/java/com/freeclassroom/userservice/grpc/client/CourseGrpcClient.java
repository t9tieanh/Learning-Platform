package com.freeclassroom.userservice.grpc.client;

import com.example.grpc.course.GetChartDataRequest;
import com.example.grpc.course.GetChartDataResponse;
import com.example.grpc.course.GetCourseAdminDataResponse;
import com.example.grpc.course.GetCourseAndStudentResponse;
import com.example.grpc.course.GetCourseRequest;
import com.example.grpc.course.GetCourseTagsRequest;
import com.example.grpc.course.GetCourseTagsResponse;
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

    public GetCourseTagsResponse getCourseTags(String courseId) {
        GetCourseTagsRequest request = GetCourseTagsRequest.newBuilder()
                .setCourseId(courseId == null ? "" : courseId)
                .build();
        return courseStub.getCourseTags(request);
    }

    public com.example.grpc.course.CourseResponse getCourseById(String courseId) {
        GetCourseRequest request = GetCourseRequest.newBuilder()
                .setId(courseId == null ? "" : courseId)
                .build();
        return courseStub.getCourse(request);
    }

    public List<com.example.grpc.course.CourseResponse> getBulkCourses(List<String> courseIds) {
        if (courseIds == null || courseIds.isEmpty()) return List.of();

        com.example.grpc.course.GetCoursesRequest request = com.example.grpc.course.GetCoursesRequest.newBuilder()
                .addAllCourseIds(courseIds)
                .build();

        com.example.grpc.course.GetCoursesResponse response = courseStub.getBulkCourses(request);
        return response == null ? List.of() : response.getCoursesList();
    }

    // NOTE: user-service currently only uses getCourseTags + admin chart endpoints.
    // Do NOT add getCourse/getBulkCourses here unless the proto-shared jar exposes the required message types
    // for this module

}
