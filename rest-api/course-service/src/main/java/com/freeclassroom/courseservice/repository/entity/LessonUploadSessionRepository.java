package com.freeclassroom.courseservice.repository.entity;

import com.freeclassroom.courseservice.entity.course.LessonUploadSessionEntity;
import com.freeclassroom.courseservice.enums.entity.EnumLessonUploadStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface LessonUploadSessionRepository extends JpaRepository<LessonUploadSessionEntity, String> {
    Optional<LessonUploadSessionEntity> findByIdAndInstructorId(String id, String instructorId);

    List<LessonUploadSessionEntity> findByStatusAndExpiresAtBefore(EnumLessonUploadStatus status, LocalDateTime expiresAt);
}

