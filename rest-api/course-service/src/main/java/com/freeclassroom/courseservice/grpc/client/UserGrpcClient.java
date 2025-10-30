package com.freeclassroom.courseservice.grpc.client;

import com.example.grpc.user.*;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserGrpcClient {
    @GrpcClient("user-service")
    private UserServiceGrpc.UserServiceBlockingStub userStub;

    public GetUserResponse getUser(String id) {
        System.out.println("id" + id);
        GetUserRequest request = GetUserRequest.newBuilder()
                .setId(id)
                .build();
        System.out.println("rest:" + request);
        return userStub.getUser(request);
    }

    public GetTeachersResponse getBulkTeachers(List<String> instructorIds) {
        GetTeachersRequest request = GetTeachersRequest.newBuilder()
                .addAllTeacherIds(instructorIds)
                .build();

        return userStub.getBulkTeachers(request);
    }

    public String getUserName(String id) {
        GetUserResponse response = getUser(id);
        return response.getName();
    }
}
