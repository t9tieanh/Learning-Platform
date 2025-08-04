package com.freeclassroom.userservice.dto.response.classroom.classdetail;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SectionResponse {
    String id;
    String title;
    String content;
    LocalDate createDate;
    boolean emphasized;
//    List<PostResponse> posts;
}
