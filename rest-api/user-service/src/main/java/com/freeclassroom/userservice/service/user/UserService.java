package com.freeclassroom.userservice.service.user;

import com.freeclassroom.userservice.configuration.RabbitMQConfig;
import com.freeclassroom.userservice.dto.request.user.CreationUserRequest;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.user.UserResponse;
import com.freeclassroom.userservice.entity.redis.PendingUserEntity;
import com.freeclassroom.userservice.entity.user.UserEntity;
import com.freeclassroom.userservice.exception.CustomExeption;
import com.freeclassroom.userservice.exception.ErrorCode;
import com.freeclassroom.userservice.mapper.user.UserMapper;
import com.freeclassroom.userservice.repository.entity.UserRepository;
import com.freeclassroom.userservice.repository.redis.PendingUserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService implements IUserService {
    PendingUserRepository pendingUserRepo;
    UserMapper userMapper;

    // template rabbitmq
    RabbitTemplate rabbitTemplate;
    RabbitMQConfig rabbitMQConfig;

    @NonFinal
    @Value("${app.frontend.verify-url}")
    private String verifyUrl;
    private final UserRepository userRepository;

    public ApiResponse<UserResponse> registerUser(CreationUserRequest request) {
        PendingUserEntity redisEntity = userMapper.toEntity(request);

        // generate token for verify
        redisEntity.setToken(UUID.randomUUID().toString());
        // Lưu vào Redis với TTL
        redisEntity = pendingUserRepo.save(redisEntity);
        // -> send to notification service
        redisEntity.setToken(verifyUrl + redisEntity.getToken());
        rabbitTemplate.convertAndSend(rabbitMQConfig.EXCHANGE, rabbitMQConfig.ROUTING_KEY, redisEntity);

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


    public ApiResponse<UserResponse> verifySignUp (String token) {
        // get token in redis
        PendingUserEntity newUser = pendingUserRepo.findById(token)
                .orElseThrow(() -> new CustomExeption(ErrorCode.WRONG_VERFY_TOKEN));

        // check user exitst
        if (userRepository.findByEmailOrUsername(newUser.getEmail(), newUser.getUsername()) != null) {
            throw new CustomExeption(ErrorCode.USER_EXISTED);
        }

        // Convert PendingUserEntity -> UserEntity
        UserEntity newUserEntity = userRepository.save(userMapper.toEntity(newUser));

        // del in redis
        pendingUserRepo.delete(newUser);

        UserResponse response = UserResponse.builder()
                .name(newUserEntity.getName())
                .email(newUserEntity.getEmail())
                .build();

        return ApiResponse.<UserResponse>builder()
                .code(200)
                .message("Xác thực thành công, chào mứng bạn đến với Learning Platform!")
                .result(response)
                .build();
    }
}
