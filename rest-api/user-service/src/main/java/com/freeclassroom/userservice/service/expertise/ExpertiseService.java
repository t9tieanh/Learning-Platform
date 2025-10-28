package com.freeclassroom.userservice.service.expertise;

import com.freeclassroom.userservice.dto.request.expertise.CreationExpertiseRequest;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.common.CreationResponse;
import com.freeclassroom.userservice.entity.user.ExpertiseEntity;
import com.freeclassroom.userservice.entity.user.UserEntity;
import com.freeclassroom.userservice.exception.CustomExeption;
import com.freeclassroom.userservice.exception.ErrorCode;
import com.freeclassroom.userservice.mapper.expertise.ExpertiseMapper;
import com.freeclassroom.userservice.repository.entity.ExpertiseRepository;
import com.freeclassroom.userservice.repository.entity.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ExpertiseService implements IExpertiseService {
    ExpertiseRepository expertiseRepo;
    UserRepository userRepo;
    ExpertiseMapper expertiseMapper;

    @Override
    public ApiResponse<CreationResponse> addExpertise(CreationExpertiseRequest request) {
        ExpertiseEntity expertiseEntity =
                expertiseRepo.save(expertiseMapper.toEntity(request));

        return ApiResponse.<CreationResponse>builder()
                .code(200)
                .message("Thêm expertise thành công !")
                .result(
                        CreationResponse.builder()
                                .id(expertiseEntity.getId())
                                .name(expertiseEntity.getName())
                                .build()
                )
                .build();
    }

    @Override
    public ApiResponse<CreationResponse> addExpertiseForUser(String userId, String expertiseId) {
        UserEntity user = userRepo.findById(userId)
                .orElseThrow(()  -> new CustomExeption(ErrorCode.USER_NOT_FOUND));

        ExpertiseEntity expertise =  expertiseRepo.findById(expertiseId)
                .orElseThrow(()  -> new CustomExeption(ErrorCode.EXPERTISE_NOT_FOUND));

        user.getExpertises().add(expertise);
        expertise.getUsers().add(user);

        userRepo.save(user);

        return ApiResponse.<CreationResponse>builder()
                .code(200)
                .message("Thêm expertise cho người dùng thành công !")
                .result(
                        CreationResponse.builder()
                                .id(expertise.getId())
                                .name(expertise.getName())
                                .build()
                )
                .build();
    }

    @Override
    public ApiResponse<Set<CreationResponse>> addBulkExpertiseForUser(String userId, List<String> expertiseIds) {
        UserEntity user = userRepo.findById(userId)
                .orElseThrow(()  -> new CustomExeption(ErrorCode.USER_NOT_FOUND));

        Set<ExpertiseEntity> expertises = new HashSet<>(expertiseRepo.findAllById(expertiseIds));
        if (expertises.isEmpty()) {
            throw new CustomExeption(ErrorCode.EXPERTISE_NOT_FOUND);
        }

        expertises.forEach(expertise -> expertise.getUsers().add(user));
        user.getExpertises().addAll(expertises);

        userRepo.save(user);

        Set<CreationResponse> responses = expertises.stream()
                .map(exp -> CreationResponse.builder()
                        .id(exp.getId())
                        .name(exp.getName())
                        .build())
                .collect(Collectors.toSet());

        return ApiResponse.<Set<CreationResponse>>builder()
                .code(200)
                .message("Thêm expertise cho người dùng thành công!")
                .result(responses)
                .build();
    }
}
