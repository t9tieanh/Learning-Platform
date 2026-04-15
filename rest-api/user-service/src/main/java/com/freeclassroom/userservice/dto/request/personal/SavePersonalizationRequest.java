package com.freeclassroom.userservice.dto.request.personal;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SavePersonalizationRequest {
    String userId;
    List<String> categories;
    List<String> tags;
    List<String> longDescriptions;
}
