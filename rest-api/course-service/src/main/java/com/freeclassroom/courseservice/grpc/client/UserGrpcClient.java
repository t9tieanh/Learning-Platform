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
        GetUserRequest request = GetUserRequest.newBuilder()
                .setId(id)
                .build();
        return userStub.getUser(request);
    }

    public GetTeachersResponse getBulkTeachers(List<String> instructorIds) {
        GetTeachersRequest request = GetTeachersRequest.newBuilder()
                .addAllTeacherIds(instructorIds)
                .build();

        return userStub.getBulkTeachers(request);
    }

    public SearchTeachersByIdsResponse searchTeachersByIds(
            List<String> instructorIds,
            String search,
            int page,
            int limit,
            String sort
    ) {
        SearchTeachersByIdsRequest request = SearchTeachersByIdsRequest.newBuilder()
                .addAllTeacherIds(instructorIds)
                .setSearch(search == null ? "" : search)
                .setPage(page)
                .setLimit(limit)
                .setSort(sort == null ? "" : sort)
                .build();

        return userStub.searchTeachersByIds(request);
    }

    public String getUserName(String id) {
        GetUserResponse response = getUser(id);
        return response.getName();
    }

    public TeacherDetail getTeacherDetail(String id) {
        GetUserRequest request = GetUserRequest.newBuilder()
                .setId(id)
                .build();
        return userStub.getTeacherDetail(request);
    }

    public AdminInstructorSummaryProfile getAdminInstructorSummaryProfile(String id) {
        GetUserRequest request = GetUserRequest.newBuilder()
                .setId(id)
                .build();
        return userStub.getAdminInstructorSummaryProfile(request);
    }
}
