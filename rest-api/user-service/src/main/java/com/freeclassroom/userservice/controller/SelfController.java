package com.freeclassroom.userservice.controller;

import com.freeclassroom.userservice.dto.request.expertise.AddExpertiseRequest;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.common.CreationResponse;
import com.freeclassroom.userservice.dto.response.user.MyProfileResponse;
import com.freeclassroom.userservice.service.expertise.IExpertiseService;
import com.freeclassroom.userservice.service.user.IUserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/self")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SelfController {
    IExpertiseService expertiseService;
    IUserService userService;

    @GetMapping
    public ApiResponse<MyProfileResponse> getMyProfile() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.geyMyProfile(userId);
    }

    @PostMapping("/expertises")
    public ApiResponse<Set<CreationResponse>> addExpertiseToCurrentUser(@RequestBody AddExpertiseRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return expertiseService.addBulkExpertiseForUser(username, request.getExpertiseIds());
    }

    @PostMapping("/expertises/{expertiseId}")
    public ApiResponse<CreationResponse> addExpertiseToCurrentUser(@PathVariable String expertiseId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return expertiseService.addExpertiseForUser(username, expertiseId);
    }
}
