package com.freeclassroom.userservice.enums;

public enum RedisStreamEnum {
    EVENT_USER("event:user"),
    EVENT_GUEST("event:guest"),
    GROUP_USER("user-group"),
    GROUP_GUEST("guest-group");

    private final String value;

    RedisStreamEnum(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
