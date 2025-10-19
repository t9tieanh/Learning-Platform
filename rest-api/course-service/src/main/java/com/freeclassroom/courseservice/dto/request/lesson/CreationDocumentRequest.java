package com.freeclassroom.courseservice.dto.request.lesson;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreationDocumentRequest {
    String chapterId;
    String title;
    String content;
    Long position;
    Boolean isPublic;
    MultipartFile file;
}
