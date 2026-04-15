package com.freeclassroom.courseservice.configuration;

import jakarta.validation.constraints.Min;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@ConfigurationProperties(prefix = "lesson.upload")
@Component
public class LessonUploadProperties {
    @Min(5 * 1024 * 1024)
    private long minChunkSize = 5 * 1024 * 1024;

    @Min(5 * 1024 * 1024)
    private long defaultChunkSize = 10 * 1024 * 1024;

    @Min(5 * 1024 * 1024)
    private long maxChunkSize = 100 * 1024 * 1024;

    private long presignExpirySeconds = 900;

    private long sessionTtlMinutes = 120;
}

