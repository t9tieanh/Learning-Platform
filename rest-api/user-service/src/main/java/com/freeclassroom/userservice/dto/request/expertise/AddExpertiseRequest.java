package com.freeclassroom.userservice.dto.request.expertise;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddExpertiseRequest {
    List<String> expertiseIds;
}
