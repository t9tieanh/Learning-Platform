package com.freeclassroom.courseservice.configuration;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.basic-auth")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BasicAuthProperties {

    public static final String PATH_LESSON_DEV_PRESIGNED_URL = "/lesson-student/*/dev-presigned-url";

    boolean enabled;

    String username;

    String password;

    String realm;

    List<String> paths = new ArrayList<>();
}
