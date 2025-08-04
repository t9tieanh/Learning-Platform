package com.freeclassroom.userservice.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ClassRoomCreationRequest {
    String name;
    String unit;
    String code;
    String detail;
    String teacherId;
    String coverImage;
}
