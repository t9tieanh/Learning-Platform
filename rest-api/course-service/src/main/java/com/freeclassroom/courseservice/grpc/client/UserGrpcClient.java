package com.freeclassroom.courseservice.grpc.client;

import com.example.grpc.user.GetUserRequest;
import com.example.grpc.user.GetUserResponse;
import com.example.grpc.user.UserServiceGrpc;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Service;

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

    public String getUserName(String id) {
        GetUserResponse response = getUser(id);
        return response.getName();
    }
}
