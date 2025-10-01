package com.freeclassroom.userservice.grpc.server;

import com.example.grpc.user.AccountStatus;
import com.example.grpc.user.GetUserRequest;
import com.example.grpc.user.GetUserResponse;
import com.example.grpc.user.UserServiceGrpc;
import com.freeclassroom.userservice.entity.user.UserEntity;
import com.freeclassroom.userservice.repository.entity.UserRepository;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import net.devh.boot.grpc.server.service.GrpcService;

@GrpcService
@RequiredArgsConstructor
public class UserGrpcService extends UserServiceGrpc.UserServiceImplBase {
    private final UserRepository userRepository;

    @Override
    public void getUser(GetUserRequest request, StreamObserver<GetUserResponse> responseObserver) {
        String id = request.getId();
        System.out.println("check id: " + id);
        UserEntity user = userRepository.findById(id).orElse(null);
        System.out.println("check user: " + user);

        if(user == null) {
            responseObserver.onError(
                    new RuntimeException("User not found with id" + id)
            );
            return;
        }

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

        responseObserver.onNext(builder.build()); //send object
        responseObserver.onCompleted(); // notify completed
    }
}
