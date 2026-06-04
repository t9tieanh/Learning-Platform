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
@ConfigurationProperties(prefix = "certificate")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CertificateProperties {
    double minQuizPassPercent = 50.0;
}
