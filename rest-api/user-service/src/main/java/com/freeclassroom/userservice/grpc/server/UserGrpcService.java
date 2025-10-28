package com.freeclassroom.userservice.grpc.server;

import com.example.grpc.user.*;
import com.freeclassroom.userservice.entity.user.UserEntity;
import com.freeclassroom.userservice.exception.ErrorCode;
import com.freeclassroom.userservice.repository.entity.UserRepository;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import net.devh.boot.grpc.server.service.GrpcService;

@GrpcService
@RequiredArgsConstructor
public class UserGrpcService extends UserServiceGrpc.UserServiceImplBase {
    private final UserRepository userRepo;

    @Override
    public void getUser(GetUserRequest request, StreamObserver<GetUserResponse> responseObserver) {
        String id = request.getId();
        UserEntity user = userRepo.findByIdWithExpertises(request.getId())
                .orElseThrow(() -> new RuntimeException("User not found with id" + id));

        GetUserResponse.Builder builder = GetUserResponse.newBuilder()
                .setId(user.getId().toString())
                .setName(user.getName() == null ? "" : user.getName())
                .setImage(user.getImage() == null ? "" : user.getImage())
                .setPhone(user.getPhone() == null ? "" : user.getPhone())
                .setDescription(user.getDescription() == null ? "" : user.getDescription())
                .setEmail(user.getEmail() == null ? "" : user.getEmail())
                .setUsername(user.getUsername() == null ? "" : user.getUsername())
                .setStatus(
                        user.getStatus() != null && user.getStatus().name().equals("ACTIVE")
                                ? AccountStatus.ACTIVE
                                : AccountStatus.INACTIVE
                );

        user.getRoles().forEach(role -> builder.addRoles(role.getName()));
        user.getExpertises().forEach(expertise -> builder.addExpertises(
                Expertise.newBuilder()
                        .setId(expertise.getId().toString())
                        .setName(expertise.getName())
                        .setImage(expertise.getImage() == null ? "" : expertise.getImage())
                        .build()
        ));

        responseObserver.onNext(builder.build()); //send object
        responseObserver.onCompleted(); // notify completed
    }
}
