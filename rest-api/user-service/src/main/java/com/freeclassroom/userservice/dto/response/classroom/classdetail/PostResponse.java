package com.freeclassroom.userservice.dto.response.classroom.classdetail;

import com.freeclassroom.userservice.enums.PostIconEnum;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostResponse {
    String id;
    String title;
    String content;
    LocalDate createDate;
    PostIconEnum postIcon;
}
