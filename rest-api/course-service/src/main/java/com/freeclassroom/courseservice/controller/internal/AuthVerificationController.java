package com.freeclassroom.courseservice.controller.internal;

import com.freeclassroom.courseservice.exception.LessonMediaAccessException;
import com.freeclassroom.courseservice.service.lesson.ILessonStudentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthVerificationController {

    ILessonStudentService lessonStudentService;

    @GetMapping("/lesson-verify")
    public ResponseEntity<Void> verifyLessonAccess(
            @CookieValue(name = "lesson_access", required = false) String lessonAccessCookie,
            @RequestHeader(value = "X-Original-URI", required = false) String originalUri
    ) {
        try {
            String objectKey = lessonStudentService.verifyLessonMediaAccess(lessonAccessCookie, originalUri);
            return ResponseEntity.ok()
                    .header("X-Object-Key", objectKey)
                    .build();
        } catch (LessonMediaAccessException exception) {
            return ResponseEntity.status(exception.getStatus()).build();
        }
    }
}
