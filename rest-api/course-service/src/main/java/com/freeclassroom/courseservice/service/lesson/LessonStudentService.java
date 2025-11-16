package com.freeclassroom.courseservice.service.lesson;

import com.freeclassroom.courseservice.configuration.CustomJwtDecoder;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.CreationResponse;
import com.freeclassroom.courseservice.dto.response.course.student.LessonOverviewResponse;
import com.freeclassroom.courseservice.entity.course.LessonEntity;
import com.freeclassroom.courseservice.entity.member.EnrollmentsEntity;
import com.freeclassroom.courseservice.entity.member.LessonProgressEntity;
import com.freeclassroom.courseservice.enums.entity.EnumLessonProgress;
import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.exception.ErrorCode;
import com.freeclassroom.courseservice.mapper.LessonMapper;
import com.freeclassroom.courseservice.mapper.LessonStudentMapper;
import com.freeclassroom.courseservice.repository.entity.EnrollmentRepository;
import com.freeclassroom.courseservice.repository.entity.LessonProgressRepository;
import com.freeclassroom.courseservice.repository.entity.LessonRepository;
import com.freeclassroom.courseservice.service.utils.cloudfront.ICloudFrontService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
@Slf4j
public class LessonStudentService implements ILessonStudentService {
    EnrollmentRepository enrollmentRepo;
    LessonRepository lessonRepo;
    LessonProgressRepository lessonProgressRepo;
    ICloudFrontService cloudFrontService;
    CustomJwtDecoder customJwtDecoder;
    LessonStudentMapper lessonMapper;

    @Value("${server.backendUri}")
    @NonFinal
    String backendUri;

    @Override
    public boolean canViewLessonByAccessToken(String lessonId, String accessToken) {
        Jwt jwtDecoded = customJwtDecoder.decode(accessToken);
        String userId = (String) jwtDecoded.getClaims().get("sub");

        boolean isEnrolled = enrollmentRepo.existsByUserIdAndCourse_Chapters_Lessons_Id(userId, lessonId);
        if (!isEnrolled) {
            throw new CustomExeption(ErrorCode.UNAUTHORIZED);
        }

        return true;
    }

    @Override
    public boolean canViewLesson(String lessonId, String userId) {
        boolean isEnrolled = enrollmentRepo.existsByUserIdAndCourse_Chapters_Lessons_Id(userId, lessonId);
        if (!isEnrolled) {
            throw new CustomExeption(ErrorCode.UNAUTHORIZED);
        }

        return true;
    }

    @Override
    public ResponseEntity<Resource> getLesson(String lessonId, String rangeHeader) throws Exception {
        LessonEntity lesson = lessonRepo.findById(lessonId).orElseThrow(
                () -> new CustomExeption(ErrorCode.LESSON_NOT_FOUND)
        );

        String lessonUri  = lesson.getUrl().replaceFirst(backendUri + "/", ""); lesson.getUrl();

        if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
            return cloudFrontService.streamFile(lessonUri, rangeHeader);
        }

        byte[] fileBytes = cloudFrontService.getFile(lessonUri);
        String fileName = lessonUri.substring(lessonUri.lastIndexOf('/') + 1);

        MediaType mediaType = MediaTypeFactory
                .getMediaType(fileName)
                .orElse(MediaType.APPLICATION_OCTET_STREAM);

        ByteArrayResource resource = new ByteArrayResource(fileBytes);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .contentType(mediaType)
                .contentLength(fileBytes.length)
                .body(resource);
    }

    @Override
    public ApiResponse<LessonOverviewResponse> getLessonInfo(String id) {
        LessonEntity lesson = lessonRepo.findById(id).orElseThrow(
                () -> new CustomExeption(ErrorCode.LESSON_NOT_FOUND)
        );

        LessonOverviewResponse response = lessonMapper.toLessonOverviewResponse(lesson);
        return ApiResponse.<LessonOverviewResponse>builder()
                .message("Lấy thông tin lesson thành công !")
                .code(200)
                .result(response)
                .build();
    }

    @Override
    public ApiResponse<CreationResponse> markDone(String lessonId, String userId) {
        EnrollmentsEntity enrollment = enrollmentRepo.findByUserIdAndCourse_Chapters_Lessons_Id(userId, lessonId)
                .orElseThrow(() -> new CustomExeption(ErrorCode.UNAUTHORIZED));

        LessonProgressEntity lessonProgress = lessonProgressRepo.findByLesson_IdAndEnrollment_Id(
                lessonId, enrollment.getId()
        );

        if (lessonProgress == null) {
            lessonProgress = LessonProgressEntity.builder()
                    .lesson(lessonRepo.findById(lessonId).orElseThrow(
                            () -> new CustomExeption(ErrorCode.LESSON_NOT_FOUND)
                    ))
                    .enrollment(enrollment)
                    .progress(EnumLessonProgress.COMPLETED)
                    .build();
        } else
            lessonProgress.setProgress(EnumLessonProgress.COMPLETED);

        lessonProgressRepo.save(lessonProgress);

        return ApiResponse.<CreationResponse>builder()
                .result(
                        CreationResponse.builder()
                                .id(lessonId)
                                .build()
                )
                .code(200)
                .message("Đã ghi nhận học xong bài học này !")
                .build();
    }
}
