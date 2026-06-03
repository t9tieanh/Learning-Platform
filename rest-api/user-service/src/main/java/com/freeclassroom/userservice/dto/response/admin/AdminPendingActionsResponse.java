package com.freeclassroom.userservice.dto.response.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminPendingActionsResponse {
    long coursePendingReviewCount;
    long certificatePendingCount;
    long rejectedCourseCount;
}
