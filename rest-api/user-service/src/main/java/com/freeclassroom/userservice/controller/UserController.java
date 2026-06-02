package com.freeclassroom.userservice.controller;

import com.freeclassroom.userservice.dto.request.auth.Identity;
import com.freeclassroom.userservice.dto.request.certificates.CreateCertReq;
import com.freeclassroom.userservice.dto.request.certificates.UpdateCertReq;
import com.freeclassroom.userservice.dto.request.personal.SavePersonalizationRequest;
import com.freeclassroom.userservice.dto.request.personal.TrackingEventRequest;
import com.freeclassroom.userservice.dto.request.user.CreationUserRequest;
import com.freeclassroom.userservice.dto.request.user.UpdateUserRequest;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.admin.DataAdminHome;
import com.freeclassroom.userservice.dto.response.admin.TopCourseAdminItem;
import com.freeclassroom.userservice.dto.response.admin.TopInstructorAdminItem;
import com.freeclassroom.userservice.dto.response.certificate.CertificateResponse;
import com.freeclassroom.userservice.dto.response.course.CourseUserResponse;
import com.freeclassroom.userservice.dto.response.personal.PersonalizationResponse;
import com.freeclassroom.userservice.dto.response.user.GetUserResponse;
import com.freeclassroom.userservice.dto.response.user.UserResponse;
import com.freeclassroom.userservice.service.certificate.ICertificateService;
import com.freeclassroom.userservice.service.personalization.IPersonalizationService;
import com.freeclassroom.userservice.service.recommendation.CourseRecommendationFacade;
import com.freeclassroom.userservice.service.user.IUserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    IUserService userService;
    ICertificateService certificateService;
    CourseRecommendationFacade courseRecommendationFacade;
    IPersonalizationService personalizationService;

    @GetMapping
    ApiResponse<UserResponse> checkStatus() {
        return ApiResponse.<UserResponse>builder()
                .code(200)
                .message("Chào mừng bạn đến với Learning Platform")
                .build();
    }

    @GetMapping("/ad-certificates")
    ApiResponse<List<CertificateResponse>> adminGetCertificates() {
        return certificateService.adminGetCertificates();
    }

    @GetMapping("/{id}")
    ApiResponse<GetUserResponse> getUser(@PathVariable UUID id) {
        return userService.getUser(id.toString());
    }

    @PostMapping
    ApiResponse<UserResponse> signUp(@RequestBody CreationUserRequest request) {
        return userService.registerUser(request);
    }

    @PostMapping("/verify")
    ApiResponse<UserResponse> verifySignUp(@RequestParam("token") String token) {
        return userService.verifySignUp(token);
    }

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApiResponse<GetUserResponse> updateUser(
            @ModelAttribute UpdateUserRequest request
    ) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.updateUser(userId, request);
    }

    @PostMapping("/certificates")
    ApiResponse<CertificateResponse> createCertificate(
            @RequestBody CreateCertReq req,
            @RequestHeader("X-User-Id") String userId
    ) {
        return certificateService.createCertificate(req, userId);
    }

    @PostMapping("/update-certificate")
    ApiResponse<Boolean> updateCertificate(
            @RequestBody UpdateCertReq request
    ) {
        return certificateService.updateCertificate(request.getId(), request.getReason(), request.getStatus());
    }

    @GetMapping("/home-admin")
    ApiResponse<DataAdminHome> getAdminData() {
        return userService.getAdminData();
    }

    @GetMapping("/admin/top-courses")
    ApiResponse<List<TopCourseAdminItem>> getAdminTopCourses(
            @RequestParam(name = "limit", defaultValue = "5") int limit
    ) {
        return userService.getAdminTopCourses(limit);
    }

    @GetMapping("/admin/top-instructors")
    ApiResponse<List<TopInstructorAdminItem>> getAdminTopInstructors(
            @RequestParam(name = "limit", defaultValue = "5") int limit
    ) {
        return userService.getAdminTopInstructors(limit);
    }

    @GetMapping("/certificates")
    ApiResponse<List<CertificateResponse>> getCertificates(
            @RequestParam("userId") String userId
    ) {
        return certificateService.getCertificates(userId);
    }

    @DeleteMapping("/del-certificate")
    ApiResponse<Boolean> deleteCertificate (@RequestParam("id") String id) {
        return certificateService.deleteCertificate(id);
    }

    @PostMapping("/track-event")
    ApiResponse<Void> trackEvent(@RequestBody TrackingEventRequest trackingEvent,
                                 HttpServletRequest request) {
        Identity identity = (Identity) request.getAttribute("IDENTITY");
        return userService.trackingEvent(identity, trackingEvent);
    }

    @GetMapping("/recommendations/courses")
    public ApiResponse<List<CourseUserResponse>> getRecommendedCourses(
            @RequestParam(required = false) String courseId,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            HttpServletRequest request
    ) {
        Identity identity = (Identity) request.getAttribute("IDENTITY");
        return courseRecommendationFacade.getRecommendedCoursesAsCourseList(identity, courseId, tag, page, size);
    }

    @PostMapping("/personalization")
    public ApiResponse<PersonalizationResponse> savePersonalization(@RequestBody SavePersonalizationRequest personalizationRequest,
                                                                    HttpServletRequest request) {
        Identity identity = (Identity) request.getAttribute("IDENTITY");
        return personalizationService.savePersonalization(identity, personalizationRequest);
    }

    @GetMapping("/personalization/{userId}")
    public ApiResponse<PersonalizationResponse> getPersonalization(@PathVariable String userId,
                                                                   HttpServletRequest request) {
        Identity identity = (Identity) request.getAttribute("IDENTITY");
        return personalizationService.getPersonalization(identity, userId);
    }
}
