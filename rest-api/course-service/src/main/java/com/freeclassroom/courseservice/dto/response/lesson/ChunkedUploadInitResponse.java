package com.freeclassroom.courseservice.dto.response.lesson;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChunkedUploadInitResponse {
    String sessionId;
    String uploadId;
    String objectKey;
    String fileUrl;
    Long chunkSize;
    Integer totalParts;
    Long expiresAt;
}

