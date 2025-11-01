package com.freeclassroom.courseservice.repository.entity;

import com.freeclassroom.courseservice.entity.member.EnrollmentsEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnrollmentRepository extends JpaRepository<EnrollmentsEntity, String> {
    boolean existsByUserIdAndCourse_Id(String userId, String courseId);
    boolean existsByUserIdAndCourse_Chapters_Lessons_Id(String userId, String lessonId);
}
