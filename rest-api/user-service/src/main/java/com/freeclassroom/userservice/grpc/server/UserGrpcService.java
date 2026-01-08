package com.freeclassroom.userservice.grpc.server;

import com.example.grpc.user.*;
import com.freeclassroom.userservice.entity.user.UserEntity;
import com.freeclassroom.userservice.mapper.certificate.CertificateMapper;
import com.freeclassroom.userservice.mapper.user.UserMapper;
import com.freeclassroom.userservice.repository.entity.CertificateRepository;
import com.freeclassroom.userservice.repository.entity.UserRepository;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import net.devh.boot.grpc.server.service.GrpcService;

import java.util.List;
import java.util.stream.Collectors;

@GrpcService
@RequiredArgsConstructor
public class UserGrpcService extends UserServiceGrpc.UserServiceImplBase {
    private final UserRepository userRepo;
    private final CertificateRepository certRepo;
    private final CertificateMapper certificateMapper;

    @Override
    public void getUser(GetUserRequest request, StreamObserver<GetUserResponse> responseObserver) {
        try {
            UserEntity user = userRepo.findByIdWithExpertises(request.getId())
                    .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại !"));

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
        } catch(Exception e) {
            responseObserver.onError(
                    io.grpc.Status.NOT_FOUND
                            .withDescription(e.getMessage())
                            .asRuntimeException()
            );
        }
    }

    @Override
    public void getTeacherDetail(GetUserRequest request, StreamObserver<TeacherDetail> responseObserver) {
        try {
            UserEntity user = userRepo.findByIdWithExpertises(request.getId())
                    .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại !"));

            TeacherDetail.Builder builder = TeacherDetail.newBuilder()
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
            // get certificate
            builder.addAllCertificates(certRepo.findAllByUserId(user.getId())
                    .stream()
                    .map(certificateMapper::toGrpc)
                    .toList());


            responseObserver.onNext(builder.build()); //send object
            responseObserver.onCompleted(); // notify completed
        } catch(Exception e) {
            responseObserver.onError(
                    io.grpc.Status.NOT_FOUND
                            .withDescription(e.getMessage())
                            .asRuntimeException()
            );
        }
    }

    @Override
    public void getBulkTeachers(GetTeachersRequest request, StreamObserver<GetTeachersResponse> responseObserver) {
        List<UserEntity> users = userRepo.findAllById(request.getTeacherIdsList());

        GetTeachersResponse.Builder responseBuilder = GetTeachersResponse.newBuilder();

        for (UserEntity userEntity : users) {
            Teacher teacher = Teacher.newBuilder()
                    .setId(userEntity.getId().toString())
                    .setName(userEntity.getName() == null ? "" : userEntity.getName())
                    .setEmail(userEntity.getEmail() == null ? "" : userEntity.getEmail())
                    .setImage(userEntity.getImage() == null ? "" : userEntity.getImage())
                    .build();

            responseBuilder.addTeachers(teacher);
        }

        responseObserver.onNext(responseBuilder.build());
        responseObserver.onCompleted();
    }
}
