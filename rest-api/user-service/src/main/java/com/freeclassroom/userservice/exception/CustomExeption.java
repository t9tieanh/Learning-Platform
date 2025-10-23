package com.freeclassroom.userservice.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@AllArgsConstructor
@RequiredArgsConstructor
public class CustomExeption extends RuntimeException {
    ErrorCode errorCode;
}
