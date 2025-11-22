package com.freeclassroom.courseservice.grpc.client;

import com.example.grpc.user.GetRevenueAndProfitRequest;
import com.example.grpc.user.GetRevenueAndProfitResponse;
import com.example.grpc.user.SaleServiceGrpc;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SaleGrpcClient {
    @GrpcClient("sale-service")
    private SaleServiceGrpc.SaleServiceBlockingStub saleStub;

    public GetRevenueAndProfitResponse getRevenueAndProfit(List<String> coursesId, long year) {
        GetRevenueAndProfitRequest request = GetRevenueAndProfitRequest.newBuilder()
                .setYear(year)
                .addAllCoursesId(coursesId)
                .build();

        return saleStub.getRevenueAndProfit(request);
    }
}
