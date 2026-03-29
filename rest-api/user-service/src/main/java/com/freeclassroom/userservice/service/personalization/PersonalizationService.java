package com.freeclassroom.userservice.service.personalization;

import com.freeclassroom.userservice.dto.request.auth.Identity;
import com.freeclassroom.userservice.dto.request.personal.SavePersonalizationRequest;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.personal.PersonalizationResponse;
import com.freeclassroom.userservice.entity.personalization.PersonalizationEntity;
import com.freeclassroom.userservice.exception.CustomExeption;
import com.freeclassroom.userservice.exception.ErrorCode;
import com.freeclassroom.userservice.repository.entity.PersonalizationRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PersonalizationService implements IPersonalizationService {

    PersonalizationRepository personalizationRepository;

    @Override
    public ApiResponse<PersonalizationResponse> savePersonalization(Identity identity, SavePersonalizationRequest request) {
        ensureUserIdentity(identity);

        if (request == null || request.getUserId() == null || request.getUserId().isBlank()) {
            throw new CustomExeption(ErrorCode.INVALID_KEY);
        }

        String identityUserId = identity.getId();
        String requestUserId = request.getUserId().trim();
        if (!requestUserId.equals(identityUserId)) {
            throw new CustomExeption(ErrorCode.UNAUTHORIZED);
        }

        List<String> categories = normalizeList(request.getCategories());
        List<String> tags = normalizeList(request.getTags());
        List<String> longDescriptions = normalizeList(request.getLongDescriptions());

        PersonalizationEntity entity = personalizationRepository.findByUserId(requestUserId)
                .orElseGet(() -> PersonalizationEntity.builder().userId(requestUserId).build());

        entity.setListCategory(categories);
        entity.setListTag(tags);
        entity.setListLongDes(longDescriptions);

        PersonalizationEntity saved = personalizationRepository.save(entity);

        return ApiResponse.<PersonalizationResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Save personalization successfully")
                .result(toResponse(saved))
                .build();
    }

    @Override
    public ApiResponse<PersonalizationResponse> getPersonalization(Identity identity, String userId) {
        ensureUserIdentity(identity);

        if (userId == null || userId.isBlank()) {
            throw new CustomExeption(ErrorCode.INVALID_KEY);
        }

        String requestUserId = userId.trim();
        if (!requestUserId.equals(identity.getId())) {
            throw new CustomExeption(ErrorCode.UNAUTHORIZED);
        }

        PersonalizationResponse response = personalizationRepository.findByUserId(requestUserId)
                .map(this::toResponse)
                .orElse(PersonalizationResponse.builder()
                        .categories(List.of())
                        .tags(List.of())
                        .longDescriptions(List.of())
                        .build());

        return ApiResponse.<PersonalizationResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get personalization successfully")
                .result(response)
                .build();
    }

    private static void ensureUserIdentity(Identity identity) {
        if (identity == null || identity.getId() == null || identity.getId().isBlank()) {
            throw new CustomExeption(ErrorCode.UNAUTHENTICATED);
        }
        if (!"USER".equals(identity.getType())) {
            throw new CustomExeption(ErrorCode.UNAUTHORIZED);
        }
    }

    private PersonalizationResponse toResponse(PersonalizationEntity entity) {
        return PersonalizationResponse.builder()
                .categories(safeList(entity.getListCategory()))
                .tags(safeList(entity.getListTag()))
                .longDescriptions(safeList(entity.getListLongDes()))
                .build();
    }

    private static List<String> safeList(List<String> values) {
        return values == null ? List.of() : values;
    }

    private static List<String> normalizeList(List<String> values) {
        if (values == null || values.isEmpty()) return List.of();

        LinkedHashSet<String> out = new LinkedHashSet<>();
        for (String v : values) {
            if (v == null) continue;
            String normalized = v.trim().toLowerCase(Locale.ROOT);
            if (!normalized.isBlank()) out.add(normalized);
        }
        return new ArrayList<>(out);
    }
}
