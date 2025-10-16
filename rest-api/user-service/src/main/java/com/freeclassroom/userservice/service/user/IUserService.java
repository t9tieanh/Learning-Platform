package com.freeclassroom.userservice.service.user;

import com.freeclassroom.userservice.dto.request.user.CreationUserRequest;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.user.GetUserResponse;
import com.freeclassroom.userservice.dto.response.user.UserResponse;

public interface IUserService {
    ApiResponse<UserResponse> registerUser(CreationUserRequest request);
    ApiResponse<UserResponse> verifySignUp (String token);
    ApiResponse<Void> forgotPassword(String email);
    ApiResponse<UserResponse> verifyForgotPassword(String code, String newPassword);
    ApiResponse<Void> checkForgotPassword(String code);
    ApiResponse<GetUserResponse> getUser(String id);
}
