package com.freeclassroom.userservice.controller;

import com.freeclassroom.userservice.dto.request.certificates.CreateCertReq;
import com.freeclassroom.userservice.dto.request.user.CreationUserRequest;
import com.freeclassroom.userservice.dto.request.user.UpdateUserRequest;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.certificate.CertificateResponse;
import com.freeclassroom.userservice.dto.response.user.GetUserResponse;
import com.freeclassroom.userservice.dto.response.user.UserResponse;
import com.freeclassroom.userservice.service.certificate.CertificateService;
import com.freeclassroom.userservice.service.certificate.ICertificateService;
import com.freeclassroom.userservice.service.user.IUserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    IUserService userService;
    ICertificateService certificateService;
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

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApiResponse<GetUserResponse> updateUser(
            @PathVariable String id,
            @ModelAttribute UpdateUserRequest request
    ) {
        return userService.updateUser(id, request);
    }

    @PostMapping("/certificates")
    ApiResponse<CertificateResponse> createCertificate(
            @RequestBody CreateCertReq req,
            @RequestHeader("X-User-Id") String userId
    ) {
        return certificateService.createCertificate(req, userId);
    }

    @GetMapping("/certificates")
    ApiResponse<List<CertificateResponse>> getCertificates(
            @RequestParam("userId") String userId
    ) {
        return certificateService.getCertificates(userId);
    }

    @DeleteMapping("/del-certificate")
    ApiResponse<Boolean> deleteCertificate (@RequestParam("id") String id) {
        return certificateService.deleteCertificate(id);
    }


}
