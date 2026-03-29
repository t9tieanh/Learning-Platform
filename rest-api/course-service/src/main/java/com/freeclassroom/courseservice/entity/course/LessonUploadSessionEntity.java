package com.freeclassroom.courseservice.entity.course;

import com.freeclassroom.courseservice.entity.AbstractEntity;
import com.freeclassroom.courseservice.enums.entity.EnumLessonType;
import com.freeclassroom.courseservice.enums.entity.EnumLessonUploadStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Where;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "lesson_upload_sessions")
@AllArgsConstructor
@NoArgsConstructor(force = true)
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Where(clause = "deleted = false")
public class LessonUploadSessionEntity extends AbstractEntity {
    @Column(nullable = false)
    String instructorId;

    @Column(nullable = false)
    String chapterId;

    @Column(nullable = false)
    String uploadId;

    @Column(nullable = false)
    String objectKey;

    @Column(nullable = false)
    String fileUrl;

    String fileName;
    String contentType;

    String title;

    @Column(columnDefinition = "TEXT")
    String content;

    Long duration;
    Long position;
    Boolean isPublic;

    Long fileSize;
    Long chunkSize;
    Integer totalParts;

    @Enumerated(EnumType.STRING)
    EnumLessonType fileType;

    @Enumerated(EnumType.STRING)
    EnumLessonUploadStatus status;

    LocalDateTime expiresAt;
    LocalDateTime completedAt;
}
