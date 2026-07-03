package com.freeclassroom.courseservice.service.lesson;

import com.freeclassroom.courseservice.configuration.LessonUploadProperties;
import com.freeclassroom.courseservice.configuration.RabbitMQConfig;
import com.freeclassroom.courseservice.dto.event.LessonAnalysisEvent;
import com.freeclassroom.courseservice.dto.request.lesson.ChunkCompleteRequest;
import com.freeclassroom.courseservice.dto.request.lesson.ChunkPresignRequest;
import com.freeclassroom.courseservice.dto.request.lesson.ChunkUploadPartRequest;
import com.freeclassroom.courseservice.dto.request.lesson.ChunkedUploadInitRequest;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.lesson.ChunkPresignResponse;
import com.freeclassroom.courseservice.dto.response.lesson.ChunkedUploadInitResponse;
import com.freeclassroom.courseservice.dto.response.lesson.LessonDto;
import com.freeclassroom.courseservice.dto.response.lesson.LessonUploadSessionResponse;
import com.freeclassroom.courseservice.dto.response.lesson.PresignedPartResponse;
import com.freeclassroom.courseservice.dto.utils.MultipartUploadSession;
import com.freeclassroom.courseservice.dto.utils.PresignedPart;
import com.freeclassroom.courseservice.entity.course.ChapterEntity;
import com.freeclassroom.courseservice.entity.course.LessonEntity;
import com.freeclassroom.courseservice.entity.course.LessonUploadSessionEntity;
import com.freeclassroom.courseservice.enums.entity.EnumLessonType;
import com.freeclassroom.courseservice.enums.entity.EnumLessonUploadStatus;
import com.freeclassroom.courseservice.enums.event.EnumLessonAnalysisType;
import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.exception.ErrorCode;
import com.freeclassroom.courseservice.mapper.LessonMapper;
import com.freeclassroom.courseservice.repository.entity.ChapterRepository;
import com.freeclassroom.courseservice.repository.entity.LessonRepository;
import com.freeclassroom.courseservice.repository.entity.LessonUploadSessionRepository;
import com.freeclassroom.courseservice.service.utils.s3.AmazonS3Client;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.CompletedPart;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class LessonUploadService implements ILessonUploadService {
    static final int S3_MAX_PARTS = 10000;

    LessonUploadSessionRepository sessionRepository;
    ChapterRepository chapterRepository;
    LessonRepository lessonRepository;
    LessonMapper lessonMapper;
    RabbitTemplate rabbitTemplate;
    LessonUploadProperties properties;
    AmazonS3Client amazonS3Client;
    LessonLimitValidator lessonLimitValidator;

    @Override
    public ChunkedUploadInitResponse initUpload(ChunkedUploadInitRequest request, String instructorId) {
        String courseId = chapterRepository.findCourseIdByChapterId(request.getChapterId())
                .orElseThrow(() -> new CustomExeption(ErrorCode.CHAPTER_NOT_FOUND));
        
        lessonLimitValidator.assertCanAddLesson(request.getChapterId(), courseId);

        long chunkSize = resolveChunkSize(request.getChunkSize());
        int totalParts = calculateTotalParts(request.getFileSize(), chunkSize);

        MultipartUploadSession multipartSession = amazonS3Client.initMultipartUpload(request.getFileName(), request.getContentType());

        LessonUploadSessionEntity session = LessonUploadSessionEntity.builder()
                .instructorId(instructorId)
                .chapterId(request.getChapterId())
                .uploadId(multipartSession.getUploadId())
                .objectKey(multipartSession.getObjectKey())
                .fileUrl(multipartSession.getFileUrl())
                .fileName(multipartSession.getFileName())
                .contentType(request.getContentType())
                .title(request.getTitle())
                .content(request.getContent())
                .duration(request.getDuration())
                .position(request.getPosition())
                .isPublic(Boolean.TRUE.equals(request.getIsPublic()))
                .fileSize(request.getFileSize())
                .chunkSize(chunkSize)
                .totalParts(totalParts)
                .status(EnumLessonUploadStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusMinutes(properties.getSessionTtlMinutes()))
                .build();

        LessonUploadSessionEntity saved = sessionRepository.save(session);

        return ChunkedUploadInitResponse.builder()
                .sessionId(saved.getId())
                .uploadId(saved.getUploadId())
                .objectKey(saved.getObjectKey())
                .fileUrl(saved.getFileUrl())
                .chunkSize(saved.getChunkSize())
                .totalParts(saved.getTotalParts())
                .expiresAt(toEpochMillis(saved.getExpiresAt()))
                .build();
    }

    @Override
    public ChunkPresignResponse generatePresignedUrls(String sessionId, ChunkPresignRequest request, String instructorId) {
        LessonUploadSessionEntity session = getSessionForInstructor(sessionId, instructorId);
        ensureSessionActive(session);

        List<Integer> partNumbers = sanitizePartNumbers(request.getPartNumbers(), session.getTotalParts());
        List<PresignedPart> presignedParts = amazonS3Client.generatePresignedUrls(
                session.getObjectKey(),
                session.getUploadId(),
                partNumbers,
                properties.getPresignExpirySeconds()
        );

        if (session.getStatus() == EnumLessonUploadStatus.PENDING) {
            session.setStatus(EnumLessonUploadStatus.UPLOADING);
            sessionRepository.save(session);
        }

        return ChunkPresignResponse.builder()
                .sessionId(sessionId)
                .parts(presignedParts.stream()
                        .map(part -> PresignedPartResponse.builder()
                                .partNumber(part.getPartNumber())
                                .url(part.getUrl())
                                .expiresAt(part.getExpiresAt())
                                .build())
                        .toList())
                .build();
    }

    @Override
    public LessonDto completeUpload(String sessionId, ChunkCompleteRequest request, String instructorId) {
        LessonUploadSessionEntity session = getSessionForInstructor(sessionId, instructorId);
        ensureSessionActive(session);

        List<CompletedPart> completedParts = toCompletedParts(request.getParts(), session.getTotalParts());
        return finalizeUpload(session, request, completedParts);
    }

    @Override
    public ApiResponse<Void> abortUpload(String sessionId, String instructorId) {
        LessonUploadSessionEntity session = getSessionForInstructor(sessionId, instructorId);
        ensureAbortable(session);

        amazonS3Client.abortMultipartUpload(session.getObjectKey(), session.getUploadId());
        session.setStatus(EnumLessonUploadStatus.ABORTED);
        sessionRepository.save(session);

        return ApiResponse.<Void>builder()
                .message("Đã hủy phiên upload thành công")
                .build();
    }

    @Override
    public LessonUploadSessionResponse getSession(String sessionId, String instructorId) {
        LessonUploadSessionEntity session = getSessionForInstructor(sessionId, instructorId);
        return LessonUploadSessionResponse.builder()
                .sessionId(session.getId())
                .chapterId(session.getChapterId())
                .status(session.getStatus())
                .chunkSize(session.getChunkSize())
                .totalParts(session.getTotalParts())
                .expiresAt(toEpochMillis(session.getExpiresAt()))
                .fileUrl(session.getFileUrl())
                .fileType(session.getFileType())
                .build();
    }

    private LessonUploadSessionEntity getSessionForInstructor(String sessionId, String instructorId) {
        return sessionRepository.findByIdAndInstructorId(sessionId, instructorId)
                .orElseThrow(() -> new CustomExeption(ErrorCode.LESSON_UPLOAD_SESSION_NOT_FOUND));
    }

    private void ensureSessionActive(LessonUploadSessionEntity session) {
        if (session.getExpiresAt() != null && session.getExpiresAt().isBefore(LocalDateTime.now())) {
            session.setStatus(EnumLessonUploadStatus.EXPIRED);
            sessionRepository.save(session);
            throw new CustomExeption(ErrorCode.LESSON_UPLOAD_SESSION_EXPIRED);
        }

        if (session.getStatus() == EnumLessonUploadStatus.COMPLETED || session.getStatus() == EnumLessonUploadStatus.ABORTED) {
            throw new CustomExeption(ErrorCode.LESSON_UPLOAD_INVALID_STATE);
        }
    }

    private void ensureAbortable(LessonUploadSessionEntity session) {
        if (session.getStatus() == EnumLessonUploadStatus.COMPLETED) {
            throw new CustomExeption(ErrorCode.LESSON_UPLOAD_INVALID_STATE);
        }
    }

    private List<Integer> sanitizePartNumbers(List<Integer> partNumbers, int totalParts) {
        Set<Integer> uniqueParts = partNumbers.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (uniqueParts.isEmpty()) {
            throw new CustomExeption(ErrorCode.LESSON_UPLOAD_INVALID_PART);
        }

        if (uniqueParts.size() > S3_MAX_PARTS) {
            throw new CustomExeption(ErrorCode.LESSON_UPLOAD_TOO_MANY_PARTS);
        }

        uniqueParts.forEach(part -> {
            if (part < 1 || part > totalParts) {
                throw new CustomExeption(ErrorCode.LESSON_UPLOAD_INVALID_PART);
            }
        });

        return uniqueParts.stream().sorted().toList();
    }

    private List<CompletedPart> toCompletedParts(List<ChunkUploadPartRequest> parts, int totalParts) {
        Set<Integer> seen = parts.stream()
                .map(ChunkUploadPartRequest::getPartNumber)
                .collect(Collectors.toSet());

        if (seen.size() != parts.size()) {
            throw new CustomExeption(ErrorCode.LESSON_UPLOAD_INVALID_PART);
        }

        return parts.stream()
                .peek(part -> {
                    if (part.getPartNumber() < 1 || part.getPartNumber() > totalParts) {
                        throw new CustomExeption(ErrorCode.LESSON_UPLOAD_INVALID_PART);
                    }
                })
                .sorted(Comparator.comparingInt(ChunkUploadPartRequest::getPartNumber))
                .map(part -> CompletedPart.builder()
                        .partNumber(part.getPartNumber())
                        .eTag(part.getEtag())
                        .build())
                .toList();
    }

    private LessonDto finalizeUpload(LessonUploadSessionEntity session,
                                     ChunkCompleteRequest request,
                                     List<CompletedPart> completedParts) {
        ChapterEntity chapter = chapterRepository.findById(session.getChapterId())
                .orElseThrow(() -> new CustomExeption(ErrorCode.CHAPTER_NOT_FOUND));

        lessonLimitValidator.assertCanAddLesson(chapter);

        EnumLessonType lessonType = resolveLessonType(request, session);
        String fileUrl = amazonS3Client.completeMultipartUpload(session.getObjectKey(), session.getUploadId(), completedParts);

        LessonEntity lesson = persistLesson(chapter, session, request, fileUrl, lessonType);

        session.setStatus(EnumLessonUploadStatus.COMPLETED);
        session.setCompletedAt(LocalDateTime.now());
        session.setFileType(lessonType);
        sessionRepository.save(session);

        publishLessonAnalysisEvent(lesson);
        return lessonMapper.toDto(lesson);
    }

    private LessonEntity persistLesson(ChapterEntity chapter,
                                       LessonUploadSessionEntity session,
                                       ChunkCompleteRequest request,
                                       String fileUrl,
                                       EnumLessonType lessonType) {
        if (lessonType == null) {
            throw new CustomExeption(ErrorCode.FILE_TYPE_INVALID);
        }

        LessonEntity newLesson = LessonEntity.builder()
                .chapter(chapter)
                .title(firstNonNull(request.getTitle(), session.getTitle()))
                .content(firstNonNull(request.getContent(), session.getContent()))
                .duration(firstNonNull(request.getDuration(), session.getDuration()))
                .position(firstNonNull(request.getPosition(), session.getPosition()))
                .isPublic(firstNonNull(request.getIsPublic(), session.getIsPublic()))
                .type(lessonType)
                .url(fileUrl)
                .build();

        return lessonRepository.save(newLesson);
    }

    private void publishLessonAnalysisEvent(LessonEntity lesson) {
        EnumLessonAnalysisType analysisType = mapToAnalysisType(lesson.getType());
        LessonAnalysisEvent eventMsg = LessonAnalysisEvent.builder()
                .lessonId(lesson.getId())
                .fileUrl(lesson.getUrl())
                .fileType(analysisType)
                .build();
        rabbitTemplate.convertAndSend(RabbitMQConfig.LESSON_ANALYSIS_EXCHANGE, RabbitMQConfig.LESSON_ANALYSIS_ROUTING_KEY, eventMsg);
    }

    private EnumLessonAnalysisType mapToAnalysisType(EnumLessonType lessonType) {
        if (lessonType == null) {
            throw new CustomExeption(ErrorCode.FILE_TYPE_INVALID);
        }
        try {
            return EnumLessonAnalysisType.valueOf(lessonType.name());
        } catch (IllegalArgumentException ex) {
            throw new CustomExeption(ErrorCode.FILE_TYPE_INVALID);
        }
    }

    private EnumLessonType resolveLessonType(ChunkCompleteRequest request, LessonUploadSessionEntity session) {
        if (request.getFileType() != null) {
            return request.getFileType();
        }
        if (session.getFileType() != null) {
            return session.getFileType();
        }
        throw new CustomExeption(ErrorCode.FILE_TYPE_INVALID);
    }

    private long resolveChunkSize(Long requested) {
        if (requested == null || requested == 0) {
            return properties.getDefaultChunkSize();
        }

        long min = properties.getMinChunkSize();
        long max = properties.getMaxChunkSize();

        if (requested < min || requested > max) {
            throw new CustomExeption(ErrorCode.LESSON_UPLOAD_INVALID_PART);
        }

        return requested;
    }

    private int calculateTotalParts(long fileSize, long chunkSize) {
        long quotient = fileSize / chunkSize;
        long remainder = fileSize % chunkSize;
        long parts = remainder == 0 ? quotient : quotient + 1;

        if (parts > S3_MAX_PARTS) {
            throw new CustomExeption(ErrorCode.LESSON_UPLOAD_TOO_MANY_PARTS);
        }

        return (int) parts;
    }

    private long toEpochMillis(LocalDateTime dateTime) {
        if (dateTime == null) {
            return 0L;
        }
        return dateTime.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
    }

    private <T> T firstNonNull(T first, T second) {
        return first != null ? first : second;
    }
}
