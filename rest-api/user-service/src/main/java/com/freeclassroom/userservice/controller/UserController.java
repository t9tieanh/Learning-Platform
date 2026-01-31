package com.freeclassroom.userservice.controller;

import com.freeclassroom.userservice.dto.request.auth.Identity;
import com.freeclassroom.userservice.dto.request.certificates.CreateCertReq;
import com.freeclassroom.userservice.dto.request.certificates.UpdateCertReq;
import com.freeclassroom.userservice.dto.request.personal.TrackingEventRequest;
import com.freeclassroom.userservice.dto.request.user.CreationUserRequest;
import com.freeclassroom.userservice.dto.request.user.UpdateUserRequest;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.admin.DataAdminHome;
import com.freeclassroom.userservice.dto.response.certificate.CertificateResponse;
import com.freeclassroom.userservice.dto.response.user.GetUserResponse;
import com.freeclassroom.userservice.dto.response.user.UserResponse;
import com.freeclassroom.userservice.service.certificate.CertificateService;
import com.freeclassroom.userservice.service.certificate.ICertificateService;
import com.freeclassroom.userservice.service.user.IUserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    IUserService userService;
    ICertificateService certificateService;
    StringRedisTemplate redis;
    @GetMapping
    ApiResponse<UserResponse> checkStatus() {
        return ApiResponse.<UserResponse>builder()
                .code(200)
                .message("Chào mừng bạn đến với Learning Platform")
                .build();
    }

    @GetMapping("/ad-certificates")
    ApiResponse<List<CertificateResponse>> adminGetCertificates() {
        return certificateService.adminGetCertificates();
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

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApiResponse<GetUserResponse> updateUser(
            @ModelAttribute UpdateUserRequest request
    ) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.updateUser(userId, request);
    }

    @PostMapping("/certificates")
    ApiResponse<CertificateResponse> createCertificate(
            @RequestBody CreateCertReq req,
            @RequestHeader("X-User-Id") String userId
    ) {
        return certificateService.createCertificate(req, userId);
    }

    @PostMapping("/update-certificate")
    ApiResponse<Boolean> updateCertificate(
            @RequestBody UpdateCertReq request
    ) {
        return certificateService.updateCertificate(request.getId(), request.getReason(), request.getStatus());
    }

    @GetMapping("/home-admin")
    ApiResponse<DataAdminHome> getAdminData() {
        return userService.getAdminData();
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

    @PostMapping("/track-event")
    ApiResponse<Void> trackEvent(@RequestBody TrackingEventRequest trackingEvent,
                                 HttpServletRequest request) {
        Identity identity = (Identity) request.getAttribute("IDENTITY");

        if (identity != null) {
            System.out.println("Type: " + identity.getType());
            System.out.println("ID: " + identity.getId());
        }

        // redis stream logic to track event
        String stream = identity.getType().equals("USER") ? "event:user" : "event:guest";

        redis.opsForStream().add(
                stream,
                Map.of(
                       "userId", identity.getId(),
                        "eventName", trackingEvent.getEventName(),
                        "payload", trackingEvent.getPayload(),
                        "createdAt", System.currentTimeMillis()
                )
        );

        return ApiResponse.<Void>builder()
                .message("Personal event tracked successfully")
                .build();
    }

}
