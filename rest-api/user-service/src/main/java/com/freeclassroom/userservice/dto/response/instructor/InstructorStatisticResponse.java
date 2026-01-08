package com.freeclassroom.userservice.dto.response.instructor;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InstructorStatisticResponse {
    Long totalCourse;
    Long totalStudent;
    Long totalBlog;
}
