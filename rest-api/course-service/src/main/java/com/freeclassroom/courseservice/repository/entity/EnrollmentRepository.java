package com.freeclassroom.courseservice.repository.entity;

import com.freeclassroom.courseservice.entity.member.EnrollmentsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface EnrollmentRepository extends JpaRepository<EnrollmentsEntity, String> {
    boolean existsByUserIdAndCourse_Id(String userId, String courseId);
    boolean existsByUserIdAndCourse_Chapters_Lessons_Id(String userId, String lessonId);

    @Transactional
    @Modifying
    @Query("DELETE FROM EnrollmentsEntity e WHERE e.userId = :userId AND e.course.id IN :courseIds")
    int deleteAllByUserIdAndCourseIds(String userId, List<String> courseIds);
}
