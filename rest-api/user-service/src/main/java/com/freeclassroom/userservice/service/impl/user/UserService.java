package com.freeclassroom.userservice.service.impl.user;

import com.freeclassroom.userservice.dto.request.user.CreationUserRequest;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.user.AuthResponse;
import com.freeclassroom.userservice.dto.response.user.UserResponse;
import com.freeclassroom.userservice.entity.redis.PendingUserEntity;
import com.freeclassroom.userservice.mapper.user.UserMapper;
import com.freeclassroom.userservice.repository.redis.PendingUserRepository;
import com.freeclassroom.userservice.service.user.IUserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService implements IUserService {
    PendingUserRepository pendingUserRepo;
    UserMapper userMapper;

    public ApiResponse<UserResponse> registerUser(CreationUserRequest request) {
        PendingUserEntity redisEntity = userMapper.toEntity(request);

        // generate token for verify
        redisEntity.setToken(UUID.randomUUID().toString());
        // Lưu vào Redis với TTL
        redisEntity = pendingUserRepo.save(redisEntity);
        UserResponse response = UserResponse.builder()
                .name(redisEntity.getName())
                .email(redisEntity.getEmail())
                .build();

        return ApiResponse.<UserResponse>builder()
                .code(200)
                .message("Vui lòng kiểm tra email để tiếp tục !")
                .result(response)
                .build();
    }
}
