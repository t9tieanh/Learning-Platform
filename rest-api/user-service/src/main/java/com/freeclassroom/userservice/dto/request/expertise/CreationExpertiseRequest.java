package com.freeclassroom.userservice.dto.request.expertise;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreationExpertiseRequest {
    String  name;
    String  image;
}
