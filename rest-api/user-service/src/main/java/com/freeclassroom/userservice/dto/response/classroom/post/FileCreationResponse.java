package com.freeclassroom.userservice.dto.response.classroom.post;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FileCreationResponse {
    String title;
    String fileUrl;
}
