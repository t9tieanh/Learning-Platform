package com.freeclassroom.courseservice.configuration;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@ConfigurationProperties(prefix = "lesson.media")
@Component
public class LessonMediaProperties {

    @NotBlank
    private String publicBaseUrl = "https://core.learnova.t9tieanh.io.vn";

    @NotBlank
    private String mediaPathPrefix = "/media/lesson";

    @NotBlank
    private String cookieName = "lesson_access";

    @NotBlank
    private String cookiePath = "/media/lesson/";

    @Min(60)
    private long cookieMaxAgeSeconds = 3600;

    private boolean cookieSecure = true;
}
