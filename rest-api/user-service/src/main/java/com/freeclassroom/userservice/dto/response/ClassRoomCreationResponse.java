package com.freeclassroom.userservice.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ClassRoomCreationResponse {
    String id;
    String name;
    String coverImage;
    String unit;
    String code;
    String detail;
}
