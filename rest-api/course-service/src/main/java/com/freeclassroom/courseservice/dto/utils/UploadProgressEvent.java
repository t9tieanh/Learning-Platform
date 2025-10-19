package com.freeclassroom.courseservice.dto.utils;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UploadProgressEvent {
    private Double progress;
    private String fileUrl;
}
