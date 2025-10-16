package com.freeclassroom.userservice.service.user;

import com.freeclassroom.userservice.configuration.RabbitMQConfig;
import com.freeclassroom.userservice.dto.request.user.CreationUserRequest;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.user.GetUserResponse;
import com.freeclassroom.userservice.dto.response.user.UserResponse;
import com.freeclassroom.userservice.entity.redis.OTPForgetPassword;
import com.freeclassroom.userservice.entity.redis.PendingUserEntity;
import com.freeclassroom.userservice.entity.user.UserEntity;
import com.freeclassroom.userservice.enums.entity.EnumAccountStatus;
import com.freeclassroom.userservice.exception.CustomExeption;
import com.freeclassroom.userservice.exception.ErrorCode;
import com.freeclassroom.userservice.mapper.user.UserMapper;
import com.freeclassroom.userservice.repository.entity.UserRepository;
import com.freeclassroom.userservice.repository.redis.OTPForgetPasswordRepository;
import com.freeclassroom.userservice.repository.redis.PendingUserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService implements IUserService {
    PendingUserRepository pendingUserRepo;
    OTPForgetPasswordRepository otpForgetPasswordRepo;
    UserMapper userMapper;

    // template rabbitmq
    RabbitTemplate rabbitTemplate;
    RabbitMQConfig rabbitMQConfig;

    //password encoder
    PasswordEncoder passwordEncoder;

    @NonFinal
    @Value("${app.frontend.verify-url}")
    private String verifyUrl;

    @NonFinal
    @Value("${app.frontend.verify-otp-forgot-password-url}")
    private String verifyForgotPassword;

    private final UserRepository userRepository;

    public ApiResponse<UserResponse> registerUser(CreationUserRequest request) {
        // check user exits
        if (userRepository.existsByEmail(request.getEmail()))
            throw new CustomExeption(ErrorCode.EMAIL_EXISTED);

        if (userRepository.existsByUsername(request.getUsername()))
            throw new CustomExeption(ErrorCode.USERNAME_EXISTED);

        PendingUserEntity redisEntity = userMapper.toEntity(request);

        // generate token for verify
        redisEntity.setToken(UUID.randomUUID().toString());
        redisEntity.setStatus(EnumAccountStatus.ACTIVE);

        // save in Redis with TTL
        redisEntity = pendingUserRepo.save(redisEntity);

        // -> send to notification service
        redisEntity.setToken("http://" + verifyUrl + redisEntity.getToken());
        rabbitTemplate.convertAndSend(rabbitMQConfig.EXCHANGE, rabbitMQConfig.VERIFY_REGISTER_ROUTING_KEY,
                redisEntity);

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


    public ApiResponse<UserResponse> verifySignUp(String token) {
        // get token in redis
        PendingUserEntity newUser = pendingUserRepo.findById(token)
                .orElseThrow(() -> new CustomExeption(ErrorCode.WRONG_VERFY_TOKEN));

        // check user exitst
        if (userRepository.existsByUsernameOrEmail(newUser.getUsername(), newUser.getEmail()))
            throw new CustomExeption(ErrorCode.USER_EXISTED);

        // endcode password
        newUser.setPassword(
                passwordEncoder.encode(newUser.getPassword())
        );

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

    public ApiResponse<Void> forgotPassword(String email) {
        // check user exits
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomExeption(ErrorCode.USER_NOT_FOUND));

        OTPForgetPassword newOtpForgetPassword = OTPForgetPassword.builder()
                .email(email)
                .name(user.getName())
                .build();

        newOtpForgetPassword = otpForgetPasswordRepo.save(newOtpForgetPassword);

        // -> send to notification service
        newOtpForgetPassword.setToken("http://" + verifyForgotPassword + newOtpForgetPassword.getToken());
        rabbitTemplate.convertAndSend(rabbitMQConfig.EXCHANGE, rabbitMQConfig.FORGOT_PASSWORD_ROUTING_KEY,
                newOtpForgetPassword);


        return ApiResponse.<Void>builder()
                .code(200)
                .message("Vui lòng kiểm tra email để tiếp tục !")
                .build();
    }

    @Override
    public ApiResponse<Void> checkForgotPassword(String code) {
        // get token in redis
        OTPForgetPassword forgetPassword = otpForgetPasswordRepo.findById(code)
                .orElseThrow(() -> new CustomExeption(ErrorCode.WRONG_VERFY_TOKEN));

        return ApiResponse.<Void>builder()
                .code(forgetPassword != null ? 200 : 0)
                .message(forgetPassword != null ? "Yêu cầu hợp lệ, bạn có thể đặt lại mật khẩu."
                        : "Yêu cầu đã hết hạn, vui lòng thử lại sau.")
                .build();
    }

    @Override
    public ApiResponse<GetUserResponse> getUser(String id) {
        try {
            UserEntity user = userRepository.findById(id)
                    .orElseThrow(() -> new CustomExeption(ErrorCode.USER_NOT_FOUND));

            GetUserResponse response = userMapper.toDto(user);

            return ApiResponse.<GetUserResponse>builder()
                    .code(HttpStatus.OK.value())
                    .message("Get user successfully")
                    .result(response)
                    .build();
        } catch (Exception e) {
            return ApiResponse.<GetUserResponse>builder()
                    .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Unexpected error: " + e.getMessage())
                    .build();
        }
    }

    public ApiResponse<UserResponse> verifyForgotPassword(String code, String newPassword) {
        // get token in redis
        OTPForgetPassword forgetPassword = otpForgetPasswordRepo.findById(code)
                .orElseThrow(() -> new CustomExeption(ErrorCode.WRONG_VERFY_TOKEN));

        // update password
        UserEntity user = userRepository.findByEmail(forgetPassword.getEmail())
                .orElseThrow(() -> new CustomExeption(ErrorCode.USER_NOT_FOUND));

        // endcode password
        user.setPassword(
                passwordEncoder.encode(newPassword)
        );

        user = userRepository.save(user);

        return ApiResponse.<UserResponse>builder()
                .code(200)
                .message("Đã đổi mật khẩu thành công !, vui lòng đăng nhập lại để trải nghiệm dịch vụ của chúng tôi !")
                .result(
                        UserResponse.builder()
                                .email(user.getEmail())
                                .name(user.getName())
                                .build()
                )
                .build();
    }


}
