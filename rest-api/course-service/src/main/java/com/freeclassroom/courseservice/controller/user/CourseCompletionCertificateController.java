package com.freeclassroom.courseservice.controller.user;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.certificate.CertificateVerifyResponse;
import com.freeclassroom.courseservice.dto.response.certificate.CourseCompletionCertificateResponse;
import com.freeclassroom.courseservice.service.certificate.ICourseCompletionCertificateService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/course-certificates")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseCompletionCertificateController {

    ICourseCompletionCertificateService certificateService;

    @GetMapping("/self")
    public ApiResponse<List<CourseCompletionCertificateResponse>> getMyCertificates() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return certificateService.getMyCertificates(userId);
    }

    @GetMapping("/verify/{code}")
    public ApiResponse<CertificateVerifyResponse> verifyByCode(@PathVariable String code) {
        return certificateService.verifyByCode(code);
    }

    @GetMapping("/{id}")
    public ApiResponse<CourseCompletionCertificateResponse> getById(@PathVariable String id) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return certificateService.getById(id, userId);
    }
}
