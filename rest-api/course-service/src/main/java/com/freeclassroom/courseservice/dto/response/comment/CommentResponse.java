package com.freeclassroom.courseservice.dto.response.comment;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommentResponse {
    String id;
    String lessonId;
    String userId;
    String userName;
    String userAvt;
    String parentId;
    String content;
    Date createdAt;
    List<CommentResponse> children = new ArrayList<>();
}
