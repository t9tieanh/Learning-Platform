package com.freeclassroom.courseservice.configuration;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app.course-approval.es-index")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseApprovalEsIndexProperties {

    /**
     * When false, the RabbitMQ consumer skips indexing (approve/reject still updates DB).
     */
    boolean enabled = true;

    /**
     * Number of retries after the first failed attempt (total attempts = maxRetries + 1).
     */
    int maxRetries = 5;

    /**
     * Linear backoff step in seconds. Retry n waits n * backoffIncrementSeconds
     * (e.g. 10s, 20s, 30s, 40s, 50s when increment is 10).
     */
    long backoffIncrementSeconds = 10;

    public int getMaxAttempts() {
        return Math.max(1, maxRetries + 1);
    }
}
