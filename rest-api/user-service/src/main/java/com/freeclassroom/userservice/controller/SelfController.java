package com.freeclassroom.userservice.controller;

import com.freeclassroom.userservice.dto.request.expertise.AddExpertiseRequest;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.common.CreationResponse;
import com.freeclassroom.userservice.service.expertise.ExpertiseService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/self")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SelfController {
    ExpertiseService expertiseService;

    @PostMapping("/expertises")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Set<CreationResponse>> addExpertiseToCurrentUser(@RequestBody AddExpertiseRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return expertiseService.addBulkExpertiseForUser(username, request.getExpertiseIds());
    }

    @PostMapping("/expertises/{expertiseId}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<CreationResponse> addExpertiseToCurrentUser(@PathVariable String expertiseId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return expertiseService.addExpertiseForUser(username, expertiseId);
    }
}
