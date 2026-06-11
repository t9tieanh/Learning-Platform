package com.freeclassroom.courseservice.controller.user;

import com.freeclassroom.courseservice.configuration.LessonMediaProperties;
import com.freeclassroom.courseservice.dto.request.lesson.MakeNoteForLessonRequest;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.CreationResponse;
import com.freeclassroom.courseservice.dto.response.course.CloudFrontCookieResponse;
import com.freeclassroom.courseservice.dto.response.lesson.MarkDoneLessonResponse;
import com.freeclassroom.courseservice.dto.response.course.LessonInfoResponse;
import com.freeclassroom.courseservice.dto.response.course.student.LessonOverviewResponse;
import com.freeclassroom.courseservice.service.lesson.ILessonStudentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/lesson-student")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LessonStudentController {
    ILessonStudentService lessonStudentService;
    LessonMediaProperties lessonMediaProperties;

    /**
     * Local/dev: CloudFront signed URL without IP binding (same policy as {@code @SignedUrl} on course intro).
     * Protected by HTTP Basic Auth — path {@link com.freeclassroom.courseservice.configuration.BasicAuthProperties#PATH_LESSON_DEV_PRESIGNED_URL}, see {@code app.basic-auth.*}.
     */
    @GetMapping("/{id}/dev-presigned-url")
    public ApiResponse<String> getDevPresignedUrl(@PathVariable String id) {
        return lessonStudentService.getPresignedUrlNoIp(id);
    }

    @GetMapping("/{id}/presigned-url")
    @PreAuthorize("@lessonStudentService.canViewLesson(#id, authentication.name)")
    public ApiResponse<String> getPresignedUrl(
            @PathVariable String id,
            @RequestParam(name = "noIp", defaultValue = "false") boolean noIp,
            HttpServletRequest request) {
        
        String clientIp = request.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isEmpty()) {
            clientIp = request.getRemoteAddr();
        } else {
            clientIp = clientIp.split(",")[0].trim();
        }

        if (noIp) {
            return lessonStudentService.getPresignedUrlNoIp(id);
        }

        return lessonStudentService.getPresignedUrl(id, clientIp);
    }

    @GetMapping("/{id}/presigned-cookies")
    @PreAuthorize("@lessonStudentService.canViewLesson(#id, authentication.name)")
    public ApiResponse<CloudFrontCookieResponse> getPresignedCookies(
            @PathVariable String id,
            HttpServletRequest request) {
        
        String clientIp = request.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isEmpty()) {
            clientIp = request.getRemoteAddr();
        } else {
            clientIp = clientIp.split(",")[0].trim();
        }

        return lessonStudentService.getPresignedCookies(id, clientIp);
    }

    @GetMapping("/{id}/media-url")
    @PreAuthorize("@lessonStudentService.canViewLesson(#id, authentication.name)")
    public ApiResponse<String> getMediaUrl(@PathVariable String id) {
        return lessonStudentService.getMediaUrl(id);
    }

    @PostMapping("/{id}/access-cookie")
    @PreAuthorize("@lessonStudentService.canViewLesson(#id, authentication.name)")
    public ResponseEntity<ApiResponse<Void>> issueAccessCookie(@PathVariable String id) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        String cookieValue = lessonStudentService.createLessonAccessCookie(id, userId);

        ResponseCookie cookie = ResponseCookie.from(lessonMediaProperties.getCookieName(), cookieValue)
                .httpOnly(true)
                .secure(lessonMediaProperties.isCookieSecure())
                .path(lessonMediaProperties.getCookiePath())
                .maxAge(Duration.ofSeconds(lessonMediaProperties.getCookieMaxAgeSeconds()))
                .sameSite("Lax")
                .build();

        ApiResponse<Void> body = ApiResponse.<Void>builder()
                .code(200)
                .message("Cấp cookie truy cập bài học thành công !")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(body);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@lessonStudentService.canViewLesson(#id, authentication.name)")
    public ResponseEntity<Resource> getLesson(
            @PathVariable String id,
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
    public ApiResponse<LessonInfoResponse> getLessonInfo(@PathVariable String id) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return lessonStudentService.getLessonInfo(id, userId);
    }

    @PostMapping("/{id}/mark-done")
    public ApiResponse<MarkDoneLessonResponse> markDone(@PathVariable String id) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return lessonStudentService.markDone(id, userId);
    }

    @PostMapping("/{id}/make-note")
    @PreAuthorize("@lessonStudentService.canViewLesson(#id, authentication.name)")
    public ApiResponse<CreationResponse> makeNote(@PathVariable String id, @RequestBody MakeNoteForLessonRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return lessonStudentService.makeNote(id, userId, request);
    }
}
