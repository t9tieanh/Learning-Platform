package com.freeclassroom.userservice.dto.response.classroom;

import lombok.*;
import lombok.experimental.FieldDefaults;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TagReponse {
    String name;
    String iconUrl;
}
