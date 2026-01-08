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
            lp.progress, 
            com.freeclassroom.courseservice.enums.entity.EnumLessonProgress.NOT_STARTED
        )
        
    )
    FROM LessonEntity l
    LEFT JOIN LessonProgressEntity lp
        ON lp.lesson.id = l.id AND lp.enrollment.id = :enrollmentId
    WHERE l.chapter.id = :chapterId
    ORDER BY l.position ASC
""")
    List<LessonOverviewResponse> findLessonOverviewWithProgressByChapter(
            @Param("chapterId") String chapterId,
            @Param("enrollmentId") String enrollmentId
    );
}
