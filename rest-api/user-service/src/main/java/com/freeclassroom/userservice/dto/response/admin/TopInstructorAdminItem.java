package com.freeclassroom.userservice.dto.response.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TopInstructorAdminItem {
    String instructorId;
    String instructorName;
    String instructorAvatar;
    long studentCount;
    long courseCount;
    double revenue;
    int rank;
}
