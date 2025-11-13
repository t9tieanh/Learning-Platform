package com.freeclassroom.courseservice.enums.sagas;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum EnumMessageType {
    ORDER_CREATED("order.created.v1"),
    REGISTER_UPDATED("register.updated.v1"),
    REGISTER_UPDATE_FAILED("register.update.failed.v1"),
    ORDER_COMPLETED("order.completed.v1"),
    ORDER_COMPLETION_FAILED("order.completion.failed.v1"),
    NOTIFICATION_SEND("notification.send.v1");

    private final String value;

    EnumMessageType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static EnumMessageType fromValue(String value) {
        for (EnumMessageType type : EnumMessageType.values()) {
            if (type.value.equals(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown MessageType: " + value);
    }
}
