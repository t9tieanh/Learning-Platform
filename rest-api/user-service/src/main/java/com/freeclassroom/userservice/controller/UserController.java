package com.freeclassroom.userservice.controller;

import com.freeclassroom.userservice.dto.request.user.CreationUserRequest;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.user.UserResponse;
import com.freeclassroom.userservice.service.user.IUserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    IUserService userService;

    @PostMapping
    ApiResponse<UserResponse> signUp(@RequestBody CreationUserRequest request) {
        return userService.registerUser(request);
    }

    @PostMapping("/verify")
    ApiResponse<UserResponse> verifySignUp(@RequestParam("token") String token) {
        return userService.verifySignUp(token);
    }
}
