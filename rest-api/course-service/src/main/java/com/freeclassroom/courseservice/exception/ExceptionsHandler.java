package com.freeclassroom.courseservice.exception;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;

@ControllerAdvice
@Slf4j
public class ExceptionsHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> exceptionHandler(Exception e) {

        log.error("Unhandled exception occurred", e);

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setCode(ErrorCode.UNCATEGORIZED_EXEPTION.getCode());
        apiResponse.setMessage(e.getMessage());

        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse> accessDeniedException(AccessDeniedException e) {

        log.warn("Access denied: {}", e.getMessage());

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setCode(ErrorCode.UNAUTHORIZED.getCode());
        apiResponse.setMessage(ErrorCode.UNAUTHORIZED.getMessage());

        return ResponseEntity
                .status(ErrorCode.UNAUTHORIZED.getStatusCode())
                .body(apiResponse);
    }

    @ExceptionHandler(CustomExeption.class)
    public ResponseEntity<ApiResponse> appRuntimeExceptionHandler(CustomExeption e) {

        ErrorCode errorCode = e.getErrorCode();

        log.info("Business exception occurred, code={}, message={}",
                errorCode.getCode(),
                errorCode.getMessage());

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMessage());

        return ResponseEntity.ok(apiResponse);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse> argumentNotValidExceptionHandler(
            MethodArgumentNotValidException e) {

        String field = e.getFieldError() != null
                ? e.getFieldError().getField()
                : "unknown";

        String defaultMessage = e.getFieldError() != null
                ? e.getFieldError().getDefaultMessage()
                : "INVALID_KEY";

        log.warn("Validation failed for field={}, message={}", field, defaultMessage);

        ErrorCode errorCode;
        try {
            errorCode = ErrorCode.valueOf(defaultMessage);
        } catch (IllegalArgumentException ex) {
            log.error("Invalid error code mapping: {}", defaultMessage, ex);
            errorCode = ErrorCode.INVALID_KEY;
        }

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMessage());

        return ResponseEntity.badRequest().body(apiResponse);
    }
}

