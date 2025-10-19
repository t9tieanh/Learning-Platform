package com.freeclassroom.courseservice.repository.entity;

import com.freeclassroom.courseservice.entity.course.LessonEntity;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface LessonRepository extends JpaRepository<LessonEntity,String> {
    @Query("SELECT l.chapter.course.instructorId FROM LessonEntity l WHERE l.id = :lessonId")
    Optional<String> findInstructorIdByLessonId(@Param("lessonId") String lessonId);
}
