package com.freeclassroom.userservice.grpc.client;

import com.example.grpc.user.GetCoursesRevenueRequest;
import com.example.grpc.user.GetCoursesRevenueResponse;
import com.example.grpc.user.SaleServiceGrpc;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SaleGrpcClient {
    @GrpcClient("sale-service")
    private SaleServiceGrpc.SaleServiceBlockingStub saleStub;

    public GetCoursesRevenueResponse getCoursesRevenue(List<String> coursesId) {
        GetCoursesRevenueRequest request = GetCoursesRevenueRequest.newBuilder()
                .addAllCoursesId(coursesId)
                .build();

        return saleStub.getCoursesRevenue(request);
    }
}
