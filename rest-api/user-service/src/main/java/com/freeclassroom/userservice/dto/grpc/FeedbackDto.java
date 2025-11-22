package com.freeclassroom.userservice.dto.grpc;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FeedbackDto {
    private String id;
    private String courseId;
    private String userId;
    private String content;
    private int rating;
    private String createdAt;
}
