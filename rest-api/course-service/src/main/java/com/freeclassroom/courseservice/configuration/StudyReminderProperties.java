package com.freeclassroom.courseservice.configuration;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.study-reminder")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StudyReminderProperties {
    /** Master switch for the daily study reminder job. */
    boolean enabled = true;

    /** Cron expression — override in application.yaml (test: every 5 min). */
    String cron = "0 */5 * * * *";

    String zone = "Asia/Ho_Chi_Minh";

    /** How many users to publish to RabbitMQ per wave (rate limiting). */
    int userBatchSize = 100;

    /** Enrollment rows loaded per DB page when building the reminder map. */
    int enrollmentPageSize = 500;

    /** Pause between user batches (ms) to avoid SMTP / broker spikes. */
    long batchDelayMs = 200L;

    /** Public web origin, e.g. https://learnova.t9tieanh.io.vn */
    String frontendBaseUrl = "http://localhost:3000";
}
