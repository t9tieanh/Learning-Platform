package com.freeclassroom.userservice.controller;

import com.freeclassroom.userservice.dto.request.expertise.CreationExpertiseRequest;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.common.CreationResponse;
import com.freeclassroom.userservice.service.expertise.IExpertiseService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/expertises")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ExpertiseController {
    IExpertiseService  expertiseService;

    @PostMapping
    ApiResponse<CreationResponse> addExpertise(@RequestBody CreationExpertiseRequest request) {
        return expertiseService.addExpertise(request);
    }
}
