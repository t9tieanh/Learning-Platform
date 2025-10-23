package com.freeclassroom.userservice.grpc;

import com.example.grpc.hello.HelloReply;
import com.example.grpc.hello.HelloRequest;
import com.example.grpc.hello.HelloServiceGrpc;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Service;

@Service
public class HelloClientService {

    @GrpcClient("course-service")
    private HelloServiceGrpc.HelloServiceBlockingStub helloStub;

    public String sayHello(String name) {
        HelloRequest request = HelloRequest.newBuilder().setName(name).build();
        HelloReply reply = helloStub.sayHello(request);
        return reply.getMessage();
    }


}
