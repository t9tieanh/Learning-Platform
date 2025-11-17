package com.freeclassroom.userservice.grpc.client;

import com.example.grpc.course.GetCourseAdminDataResponse;
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

}
