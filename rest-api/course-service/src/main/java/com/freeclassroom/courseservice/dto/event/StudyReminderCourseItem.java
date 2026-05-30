package com.freeclassroom.courseservice.dto.event;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StudyReminderCourseItem {
    String courseId;
    String title;
    String thumbnailUrl;
    Double progress;
    String courseUrl;
}
