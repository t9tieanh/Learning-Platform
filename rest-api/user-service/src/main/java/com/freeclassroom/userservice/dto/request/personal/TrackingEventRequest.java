package com.freeclassroom.userservice.dto.request.personal;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TrackingEventRequest {
    String eventName;
    Map<String, String> payload;
}
