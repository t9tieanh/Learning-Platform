package com.freeclassroom.courseservice.dto.sagas;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.freeclassroom.courseservice.enums.sagas.EnumMessageType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MessageDTO<T> {
    private EnumMessageType type;
    private String version;
    private String correlationId;
    private String source;
    @Builder.Default
    private Instant timestamp = Instant.now();
    private T payload;
}
