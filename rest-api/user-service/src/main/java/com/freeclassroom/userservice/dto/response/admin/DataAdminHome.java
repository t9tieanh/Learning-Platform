package com.freeclassroom.userservice.dto.response.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DataAdminHome {
    long courseCnt;
    long instructorCnt;
    long certificateCnt;
    long blogCnt;
}
