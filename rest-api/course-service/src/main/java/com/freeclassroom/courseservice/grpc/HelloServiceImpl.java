package com.freeclassroom.courseservice.grpc;

import com.example.grpc.hello.HelloReply;
import com.example.grpc.hello.HelloRequest;
import com.example.grpc.hello.HelloServiceGrpc;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;

@GrpcService
public class HelloServiceImpl extends HelloServiceGrpc.HelloServiceImplBase {

    @Override
    public void sayHello(HelloRequest request, StreamObserver<HelloReply> responseObserver) {
        String greeting = "Xin chào, " + request.getName();
        HelloReply reply = HelloReply.newBuilder().setMessage(greeting).build();
        responseObserver.onNext(reply);
        responseObserver.onCompleted();
    }
}
