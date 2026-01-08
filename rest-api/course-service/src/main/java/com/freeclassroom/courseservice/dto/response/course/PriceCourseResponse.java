package com.freeclassroom.courseservice.dto.response.course;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PriceCourseResponse {
    String id;
    String name;
    Double originalPrice;
    Double finalPrice;
    Double yourIncome;
    Double platformFee;
}