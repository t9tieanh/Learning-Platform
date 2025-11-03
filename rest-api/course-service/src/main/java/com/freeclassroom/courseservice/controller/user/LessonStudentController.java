package com.freeclassroom.courseservice.controller.user;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.course.student.LessonOverviewResponse;
import com.freeclassroom.courseservice.service.lesson.ILessonStudentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/lesson-student")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LessonStudentController {
    ILessonStudentService lessonStudentService;

    @GetMapping("/{id}")
    @PreAuthorize("@lessonStudentService.canViewLessonByAccessToken(#id, #token)")
    public ResponseEntity<Resource> getLesson(
            @PathVariable String id,
            @RequestParam(name = "token", required = true) String token,
            @RequestHeader(value = "Range", required = false) String rangeHeader) {
        try {
            return lessonStudentService.getLesson(id, rangeHeader);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}/info")
    @PreAuthorize("@lessonStudentService.canViewLesson(#id, authentication.name)")
    public ApiResponse<LessonOverviewResponse> getLessonInfo(@PathVariable String id) {
        return lessonStudentService.getLessonInfo(id);
    }
}
