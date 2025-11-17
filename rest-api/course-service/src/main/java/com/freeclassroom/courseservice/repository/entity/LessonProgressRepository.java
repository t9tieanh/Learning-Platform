package com.freeclassroom.courseservice.repository.entity;

import com.freeclassroom.courseservice.entity.member.LessonProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonProgressRepository extends JpaRepository<LessonProgressEntity, String> {
    LessonProgressEntity findByLesson_IdAndEnrollment_Id(String lessonId, String enrollmentId);
}
