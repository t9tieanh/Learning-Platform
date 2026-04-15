package com.freeclassroom.userservice.service.personalization;

import com.freeclassroom.userservice.dto.request.auth.Identity;
import com.freeclassroom.userservice.dto.request.personal.SavePersonalizationRequest;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.personal.PersonalizationResponse;

public interface IPersonalizationService {
    ApiResponse<PersonalizationResponse> savePersonalization(Identity identity, SavePersonalizationRequest request);

    ApiResponse<PersonalizationResponse> getPersonalization(Identity identity, String userId);
}
