package com.freeclassroom.courseservice.dto.certificate;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseScoreSummary {
    int earned;
    int total;

    public static CourseScoreSummary noTestsDefault() {
        return new CourseScoreSummary(10, 10);
    }
}
