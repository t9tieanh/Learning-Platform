package com.freeclassroom.userservice.service.expertise;

import com.freeclassroom.userservice.dto.request.expertise.CreationExpertiseRequest;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.common.CreationResponse;

import java.util.List;
import java.util.Set;

public interface IExpertiseService {
    ApiResponse<CreationResponse> addExpertise(CreationExpertiseRequest request);
    ApiResponse<CreationResponse> addExpertiseForUser(String userId, String expertiseId);
    ApiResponse<Set<CreationResponse>> addBulkExpertiseForUser(String userId, List<String> expertiseId);
}
