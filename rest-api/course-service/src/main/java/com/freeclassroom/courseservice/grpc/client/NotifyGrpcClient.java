package com.freeclassroom.courseservice.grpc.client;

import com.example.grpc.course.PushSupabaseRequest;
import com.example.grpc.course.PushSupabaseResponse;
import com.example.grpc.user.BlogServiceGrpc;
import com.example.grpc.user.GetRevenueAndProfitRequest;
import com.example.grpc.user.GetRevenueAndProfitResponse;
import com.example.grpc.user.SaleServiceGrpc;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotifyGrpcClient {
    @GrpcClient("notify-service")
    private BlogServiceGrpc.BlogServiceBlockingStub notifyStub;

    public PushSupabaseResponse pushCourseSupabase(String id, String name, String description, String[] tags, String link) {
        PushSupabaseRequest request = PushSupabaseRequest.newBuilder()
                .setId(id)
                .setName(name)
                .setDescription(description)
                .addAllTags(List.of(tags))
                .setLink(link)
                .build();
        return notifyStub.pushCourseSupabase(request);
    }
}
