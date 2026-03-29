package com.freeclassroom.courseservice.dto.response.lesson;

import com.freeclassroom.courseservice.enums.entity.EnumLessonType;
import com.freeclassroom.courseservice.enums.entity.EnumLessonUploadStatus;
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
public class LessonUploadSessionResponse {
    String sessionId;
    String chapterId;
    EnumLessonUploadStatus status;
    Long chunkSize;
    Integer totalParts;
    Long expiresAt;
    String fileUrl;
    EnumLessonType fileType;
}
