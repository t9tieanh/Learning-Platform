package com.freeclassroom.userservice.enums.role;

import com.fasterxml.jackson.annotation.JsonValue;

public enum TokenEnum {
    RESFESH_TOKEN("reshfesh"),
    ACCESS_TOKEN("access"),
    ;

    @JsonValue
    public String getValue() {
        return name;
    }

    private final String name;

    TokenEnum(String name) {
        this.name = name;
    }
}
