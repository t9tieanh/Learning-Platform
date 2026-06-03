package com.freeclassroom.userservice.grpc.server;

import com.example.grpc.user.*;
import com.freeclassroom.userservice.entity.user.UserEntity;
import com.freeclassroom.userservice.mapper.certificate.CertificateMapper;
import com.freeclassroom.userservice.repository.entity.CertificateRepository;
import com.freeclassroom.userservice.repository.entity.UserRepository;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;

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
    public void getAdminInstructorSummaryProfile(
            GetUserRequest request,
            StreamObserver<AdminInstructorSummaryProfile> responseObserver
    ) {
        try {
            UserEntity user = userRepo.findByIdWithExpertises(request.getId())
                    .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại !"));

            List<InstructorCertificatePreview> certificates = certRepo
                    .findConfirmedCertificatePreviewByUserId(user.getId(), PageRequest.of(0, 5))
                    .stream()
                    .map(cert -> InstructorCertificatePreview.newBuilder()
                            .setId(defaultString(cert.getId()))
                            .setTitle(defaultString(cert.getTitle()))
                            .setOrganization(defaultString(cert.getOrganization()))
                            .setIssueDate(cert.getIssueDate() == null ? "" : cert.getIssueDate().toString())
                            .setImageUrl(defaultString(cert.getImageUrl()))
                            .build())
                    .toList();

            AdminInstructorSummaryProfile.Builder builder = AdminInstructorSummaryProfile.newBuilder()
                    .setId(defaultString(user.getId()))
                    .setName(defaultString(user.getName()))
                    .setEmail(defaultString(user.getEmail()))
                    .setImage(defaultString(user.getImage()))
                    .setDescription(defaultString(user.getDescription()))
                    .addAllCertificates(certificates)
                    .setTotalCertificates(certRepo.countConfirmedCertificatesByUserId(user.getId()));

            user.getExpertises().forEach(expertise -> builder.addExpertises(
                    Expertise.newBuilder()
                            .setId(defaultString(expertise.getId()))
                            .setName(defaultString(expertise.getName()))
                            .setImage(defaultString(expertise.getImage()))
                            .build()
            ));

            responseObserver.onNext(builder.build());
            responseObserver.onCompleted();
        } catch (Exception e) {
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

    @Override
    public void searchTeachersByIds(
            SearchTeachersByIdsRequest request,
            StreamObserver<SearchTeachersByIdsResponse> responseObserver
    ) {
        List<String> teacherIds = request.getTeacherIdsList();
        if (teacherIds == null || teacherIds.isEmpty()) {
            responseObserver.onNext(SearchTeachersByIdsResponse.newBuilder().setHasNext(false).build());
            responseObserver.onCompleted();
            return;
        }

        int page = Math.max(request.getPage(), 1);
        int limit = Math.min(Math.max(request.getLimit(), 1), 100);
        String normalizedSearch = defaultString(request.getSearch()).trim().toLowerCase();
        PageRequest pageable = PageRequest.of(page - 1, limit);

        Page<UserEntity> usersPage = "name_desc".equalsIgnoreCase(request.getSort())
                ? userRepo.searchTeachersByIdsOrderByNameDesc(teacherIds, normalizedSearch, pageable)
                : userRepo.searchTeachersByIdsOrderByNameAsc(teacherIds, normalizedSearch, pageable);

        SearchTeachersByIdsResponse.Builder responseBuilder = SearchTeachersByIdsResponse.newBuilder()
                .setHasNext(usersPage.hasNext());

        usersPage.getContent().forEach(userEntity -> responseBuilder.addTeachers(
                Teacher.newBuilder()
                        .setId(defaultString(userEntity.getId()))
                        .setName(defaultString(userEntity.getName()))
                        .setEmail(defaultString(userEntity.getEmail()))
                        .setImage(defaultString(userEntity.getImage()))
                        .build()
        ));

        responseObserver.onNext(responseBuilder.build());
        responseObserver.onCompleted();
    }

    /**
     * CheckIsVip - Checks if a user has active VIP subscription.
     * 
     * Used by assistant-service for quiz generation authorization.
     * Returns whether user has VIP status and if VIP period is still valid.
     * 
     * @param request CheckIsVipRequest with user_id
     * @param responseObserver StreamObserver for async response
     */
    @Override
    public void checkIsVip(CheckIsVipRequest request, StreamObserver<CheckIsVipResponse> responseObserver) {
        try {
            String userId = request.getUserId();
            
            if (userId == null || userId.isEmpty()) {
                throw new IllegalArgumentException("User ID cannot be empty");
            }

            UserEntity user = userRepo.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

            // Check if user has VIP status
            boolean isVip = user.getIsVip() != null && user.getIsVip();
            
            // If VIP is true, verify VIP period is still active (if updateVipAt exists)
            if (isVip && user.getUpdateVipAt() != null && user.getDurationOfVip() != null) {
                java.time.LocalDateTime vipExpiryTime = user.getUpdateVipAt()
                        .plusDays(user.getDurationOfVip());
                java.time.LocalDateTime now = java.time.LocalDateTime.now();
                
                // If VIP period has expired, set isVip to false
                if (now.isAfter(vipExpiryTime)) {
                    isVip = false;
                }
            }

            CheckIsVipResponse response = CheckIsVipResponse.newBuilder()
                    .setIsVip(isVip)
                    .setMessage(isVip ? "User is VIP" : "User is not VIP")
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            responseObserver.onError(
                    io.grpc.Status.NOT_FOUND
                            .withDescription(e.getMessage())
                            .asRuntimeException()
            );
        }
    }

    private String defaultString(Object value) {
        return value == null ? "" : value.toString();
    }
}
