package com.freeclassroom.courseservice.dto.snapshot;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RecipientSnapshot {
    String userId;
    String name;
}
