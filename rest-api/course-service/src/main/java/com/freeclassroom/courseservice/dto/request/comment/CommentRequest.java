package com.freeclassroom.courseservice.dto.request.comment;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommentRequest {
    String lessonId;
    String userId;
    String parentId;
    String content;
}
