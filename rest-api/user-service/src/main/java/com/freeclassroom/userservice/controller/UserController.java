package com.freeclassroom.userservice.controller;

import com.freeclassroom.userservice.dto.request.user.CreationUserRequest;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.common.CreationResponse;
import com.freeclassroom.userservice.dto.response.user.GetUserResponse;
import com.freeclassroom.userservice.dto.response.user.UserResponse;
import com.freeclassroom.userservice.service.expertise.IExpertiseService;
import com.freeclassroom.userservice.service.user.IUserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    IUserService userService;

    @GetMapping
    ApiResponse<UserResponse> checkStatus() {
        return ApiResponse.<UserResponse>builder()
                .code(200)
                .message("Chào mừng bạn đến với Learning Platform")
                .build();
    }

    @GetMapping("/{id}")
    ApiResponse<GetUserResponse> getUser(@PathVariable UUID id) {
        return userService.getUser(id.toString());
    }

    @PostMapping
    ApiResponse<UserResponse> signUp(@RequestBody CreationUserRequest request) {
        return userService.registerUser(request);
    }

    @PostMapping("/verify")
    ApiResponse<UserResponse> verifySignUp(@RequestParam("token") String token) {
        return userService.verifySignUp(token);
    }
}
