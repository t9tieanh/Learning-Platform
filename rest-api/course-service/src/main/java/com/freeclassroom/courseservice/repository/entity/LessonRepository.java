package com.freeclassroom.courseservice.repository.entity;

import com.freeclassroom.courseservice.dto.response.course.student.LessonOverviewResponse;
import com.freeclassroom.courseservice.entity.course.LessonEntity;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface LessonRepository extends JpaRepository<LessonEntity,String> {
    @Query("SELECT l.chapter.course.instructorId FROM LessonEntity l WHERE l.id = :lessonId")
    Optional<String> findInstructorIdByLessonId(@Param("lessonId") String lessonId);

    @Query("""
    SELECT new com.freeclassroom.courseservice.dto.response.course.student.LessonOverviewResponse(
        l.id,
        l.title,
        l.content,
        l.duration,
        l.position,
        l.type,
        COALESCE(
            (
                SELECT lp.progress
                FROM LessonProgressEntity lp
                WHERE lp.lesson.id = l.id
                  AND lp.enrollment.id = :enrollmentId
                  AND lp.updatedAt = (
                      SELECT MAX(lp2.updatedAt)
                      FROM LessonProgressEntity lp2
                      WHERE lp2.lesson.id = l.id
                        AND lp2.enrollment.id = :enrollmentId
                  )
            ),
            com.freeclassroom.courseservice.enums.entity.EnumLessonProgress.NOT_STARTED
        )
    )
    FROM LessonEntity l
    WHERE l.chapter.id = :chapterId
    ORDER BY l.position ASC
""")
    List<LessonOverviewResponse> findLessonOverviewWithProgressByChapter(
            @Param("chapterId") String chapterId,
            @Param("enrollmentId") String enrollmentId
    );

    @Query("""
            SELECT l.id
            FROM LessonEntity l
            JOIN l.chapter ch
            WHERE ch.course.id = :courseId
            ORDER BY ch.position ASC, l.position ASC
            """)
    List<String> findIdsByCourseId(@Param("courseId") String courseId);
}
