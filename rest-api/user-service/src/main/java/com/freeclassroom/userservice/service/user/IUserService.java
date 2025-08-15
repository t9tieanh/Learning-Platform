package com.freeclassroom.userservice.service.user;

import com.freeclassroom.userservice.dto.request.user.CreationUserRequest;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.user.UserResponse;

public interface IUserService {
    ApiResponse<UserResponse> registerUser(CreationUserRequest request);
}
