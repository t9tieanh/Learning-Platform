package com.freeclassroom.courseservice.repository.entity;

import com.freeclassroom.courseservice.entity.member.EnrollmentsEntity;
import com.freeclassroom.courseservice.dto.response.admin.AdminEnrollmentBucketProjection;
import com.freeclassroom.courseservice.enums.entity.EnumCompletionStatus;
import com.freeclassroom.courseservice.enums.entity.EnumCourseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<EnrollmentsEntity, String> {
    boolean existsByUserIdAndCourse_Id(String userId, String courseId);
    boolean existsByUserIdAndCourse_Chapters_Lessons_Id(String userId, String lessonId);
    List<EnrollmentsEntity> findAllByUserId(String userId);
    Optional<EnrollmentsEntity> findByUserIdAndCourse_Chapters_Lessons_Id(String userId, String courseId);
    Optional<EnrollmentsEntity> findByUserIdAndCourse_Id(String userId, String courseId);

    @Transactional
    @Modifying
    @Query("DELETE FROM EnrollmentsEntity e WHERE e.userId = :userId AND e.course.id IN :courseIds")
    int deleteAllByUserIdAndCourseIds(String userId, List<String> courseIds);

    @Query("""
            SELECT e FROM EnrollmentsEntity e
            JOIN FETCH e.course c
            WHERE c.status = :publishedStatus
            AND e.userId <> c.instructorId
            AND (e.status IS NULL OR e.status <> :completedStatus)
            AND (e.progress IS NULL OR e.progress < 100.0)
            ORDER BY e.userId ASC, c.title ASC
            """)
    Page<EnrollmentsEntity> findActiveEnrollmentsForStudyReminder(
            @Param("publishedStatus") EnumCourseStatus publishedStatus,
            @Param("completedStatus") EnumCompletionStatus completedStatus,
            Pageable pageable
    );

    @Query("""
            SELECT FUNCTION('DATE_FORMAT', e.enrollmentDate, '%Y-%m-%d') AS bucketKey,
                   COUNT(e.id) AS studentCount
            FROM EnrollmentsEntity e
            JOIN e.course c
            WHERE c.status = com.freeclassroom.courseservice.enums.entity.EnumCourseStatus.PUBLISHED
              AND c.progressStep = com.freeclassroom.courseservice.enums.entity.EnumCourseProgressStep.COMPLETED
              AND c.deleted = false
              AND e.enrollmentDate >= :startAt
              AND e.enrollmentDate < :endAt
            GROUP BY FUNCTION('DATE_FORMAT', e.enrollmentDate, '%Y-%m-%d')
            ORDER BY bucketKey ASC
            """)
    List<AdminEnrollmentBucketProjection> countAdminEnrollmentsByDay(
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt
    );

    @Query("""
            SELECT FUNCTION('DATE_FORMAT', e.enrollmentDate, '%Y-%m') AS bucketKey,
                   COUNT(e.id) AS studentCount
            FROM EnrollmentsEntity e
            JOIN e.course c
            WHERE c.status = com.freeclassroom.courseservice.enums.entity.EnumCourseStatus.PUBLISHED
              AND c.progressStep = com.freeclassroom.courseservice.enums.entity.EnumCourseProgressStep.COMPLETED
              AND c.deleted = false
              AND e.enrollmentDate >= :startAt
              AND e.enrollmentDate < :endAt
            GROUP BY FUNCTION('DATE_FORMAT', e.enrollmentDate, '%Y-%m')
            ORDER BY bucketKey ASC
            """)
    List<AdminEnrollmentBucketProjection> countAdminEnrollmentsByMonth(
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt
    );

}
