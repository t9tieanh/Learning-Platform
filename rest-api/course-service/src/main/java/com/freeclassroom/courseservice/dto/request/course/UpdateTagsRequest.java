package com.freeclassroom.courseservice.dto.request.course;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateTagsRequest {
    List<String> tagIds;
}
