package com.freeclassroom.userservice.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum PostIconEnum {
    NOTICE("notice.png"),
    TEST("test.png"),
    EXERCISE("exercise.png"),
    FILE("file.png"),
    ;

    @JsonValue
    public String getValue() {
        return icon;
    }

    private final String icon;

    PostIconEnum(String icon) {
        this.icon = icon;
    }

    public String getIcon() {
        return icon;
    }
}

