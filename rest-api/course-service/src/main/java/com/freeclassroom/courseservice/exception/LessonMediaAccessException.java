package com.freeclassroom.courseservice.exception;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LessonMediaAccessException extends RuntimeException {

    HttpStatus status;

    public LessonMediaAccessException(HttpStatus status) {
        super(status.getReasonPhrase());
        this.status = status;
    }
}
