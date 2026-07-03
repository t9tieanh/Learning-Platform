package com.freeclassroom.courseservice.configuration;

import jakarta.validation.constraints.Min;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@ConfigurationProperties(prefix = "course.limits")
@Component
public class CourseLimitsProperties {
    @Min(1)
    private int maxLessonsPerChapter = 5;

    @Min(1)
    private int maxLessonsPerCourse = 20;
}
