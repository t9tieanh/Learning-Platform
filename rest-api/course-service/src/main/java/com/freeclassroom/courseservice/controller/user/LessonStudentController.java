package com.freeclassroom.courseservice.controller.user;

import com.freeclassroom.courseservice.service.lesson.ILessonService;
import com.freeclassroom.courseservice.service.lesson.ILessonStudentService;
import com.freeclassroom.courseservice.service.utils.cloudfront.ICloudFrontService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/lesson-student")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LessonStudentController {
    ICloudFrontService cloudFrontService;
    ILessonStudentService lessonStudentService;

    @GetMapping("/{id}")
    @PreAuthorize("@lessonStudentService.canViewLesson(#id, token)")
    public ResponseEntity<Resource> getLesson(
            @PathVariable String id,
            @RequestParam(name = "token", required = true) String token,
            @RequestHeader(value = "Range", required = false) String rangeHeader) {
        try {
            if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
                return cloudFrontService.streamFile(id, rangeHeader);
            }

            byte[] fileBytes = cloudFrontService.getFile(id);
            String fileName = id.substring(id.lastIndexOf('/') + 1);

            MediaType mediaType = MediaTypeFactory
                    .getMediaType(fileName)
                    .orElse(MediaType.APPLICATION_OCTET_STREAM);

            ByteArrayResource resource = new ByteArrayResource(fileBytes);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .contentType(mediaType)
                    .contentLength(fileBytes.length)
                    .body(resource);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
