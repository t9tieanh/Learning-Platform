package com.freeclassroom.userservice.grpc.client;

import com.example.grpc.course.GetCourseAdminDataResponse;
import com.example.grpc.course.TotalBlogResponse;
import com.example.grpc.user.BlogServiceGrpc;
import com.example.grpc.user.CourseServiceGrpc;
import com.example.grpc.user.GetUserRequest;
import com.google.protobuf.Empty;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Service;

@Service
public class BlogGrpcClient {
    @GrpcClient("blog-service")
    private BlogServiceGrpc.BlogServiceBlockingStub blogStub;

    public TotalBlogResponse getTotalBlog() {
        return blogStub.getTotalBlog(Empty.getDefaultInstance());
    }

    public TotalBlogResponse getTotalInstructorBlog(String userId) {
        GetUserRequest request = GetUserRequest.newBuilder()
                .setId(userId)
                .build();
        return blogStub.getTotalInstructorBlog(request);
    }
}
