package com.freeclassroom.userservice.dto.request.certificates;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateCertReq {
    String id;
    String reason;
    String status;
}
