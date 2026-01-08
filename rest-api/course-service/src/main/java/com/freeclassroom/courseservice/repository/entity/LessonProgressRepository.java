package com.freeclassroom.courseservice.repository.entity;

import com.freeclassroom.courseservice.entity.member.LessonProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonProgressRepository extends JpaRepository<LessonProgressEntity, String> {
    LessonProgressEntity findByLesson_IdAndEnrollment_Id(String lessonId, String enrollmentId);

    // get all enrollment
    List<LessonProgressEntity> findByEnrollment_Id(String enrollmentId);
}
