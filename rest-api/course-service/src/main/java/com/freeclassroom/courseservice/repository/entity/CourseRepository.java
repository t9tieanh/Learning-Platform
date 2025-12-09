package com.freeclassroom.courseservice.repository.entity;

import com.freeclassroom.courseservice.entity.course.CourseEntity;
import com.freeclassroom.courseservice.enums.entity.EnumCourseProgressStep;
import com.freeclassroom.courseservice.enums.entity.EnumCourseStatus;
import feign.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<CourseEntity, String> {
    Optional<CourseEntity> findByIdAndInstructorId(String id, String instructorId);
    boolean existsByIdAndInstructorId(String id, String instructorId);
    List<CourseEntity> findAllByInstructorId(String instructorId);

    Page<CourseEntity> findByInstructorId(String instructorId, Pageable pageable);
    @EntityGraph(attributePaths = {"tags"})
    @Query("select c from CourseEntity c where c.id = :id")
    Optional<CourseEntity> findByIdWithTags(@Param("id") String id);

    @EntityGraph(attributePaths = {"chapters"})
    @Query("select c from CourseEntity c where c.id = :id")
    Optional<CourseEntity> findByIdWithChapters(@Param("id") String id);

    @EntityGraph(attributePaths = {"enrollments"})
    @Query("select c from CourseEntity c where c.id = :id")
    Optional<CourseEntity> findByIdWithEnrollments(@Param("id") String id);

    @Query("""
        SELECT c 
        FROM CourseEntity c 
        LEFT JOIN c.enrollments e
        WHERE c.status = 'PUBLISHED'
        GROUP BY c 
        ORDER BY COUNT(e) DESC
    """)
    List<CourseEntity> findBestSellerCourses(Pageable pageable);

    @Query("""
        SELECT c
        FROM CourseEntity c
        LEFT JOIN c.enrollments e
        WHERE c.status = 'PUBLISHED'
          AND FUNCTION('MONTH', e.enrollmentDate) = :month
          AND FUNCTION('YEAR', e.enrollmentDate) = :year
        GROUP BY c
        ORDER BY COUNT(e) DESC
    """)
    List<CourseEntity> getTrendyCourse(Pageable pageable, int month, int year);

    @Query("""
        SELECT c FROM CourseEntity c
        WHERE c.status = 'PUBLISHED'
        AND (:search IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:category IS NULL OR c.category.name = :category)
        AND (:minPrice IS NULL OR c.finalPrice >= :minPrice)
        AND (:minRating IS NULL OR c.rating >= :minRating)
    """)
    Page<CourseEntity> findAllWithFilters(
            @Param("search") String search,
            @Param("category") String category,
            @Param("minPrice") Double minPrice,
            @Param("minRating") Double minRating,
            Pageable pageable
    );

    @Query("""
        SELECT COALESCE(SUM(l.duration), 0)
        FROM CourseEntity c
        JOIN c.chapters ch
        JOIN ch.lessons l
        WHERE c.id = :courseId
          AND l.type = com.freeclassroom.courseservice.enums.entity.EnumLessonType.video and l.deleted = false
    """)
    Double getTotalVideoDurationByCourseId(@Param("courseId") String courseId);

    @Query("""
        SELECT COUNT(l)
        FROM CourseEntity c
        JOIN c.chapters ch
        JOIN ch.lessons l
        WHERE c.id = :courseId and l.deleted = false
    """)
    Long countLessonsByCourseId(@Param("courseId") String courseId);

    @Query("""
    SELECT COUNT(c)
    FROM CourseEntity c
    WHERE c.instructorId = :instructorId
      AND c.deleted = false
""")
    Long countByInstructorIdAndNotDeleted(@Param("instructorId") String instructorId);

    @Query("""
    SELECT c FROM CourseEntity c
    JOIN c.enrollments e
    WHERE e.userId = :userId
      AND c.deleted = false
      AND c.status = com.freeclassroom.courseservice.enums.entity.EnumCourseStatus.PUBLISHED
""")
    Page<CourseEntity> findAllByUserId(@Param("userId") String userId, Pageable pageable);

    @Query("SELECT c FROM CourseEntity c LEFT JOIN FETCH c.enrollments WHERE c.instructorId = :instructorId")
    List<CourseEntity> findAllByInstructorIdWithEnrollments(@Param("instructorId") String instructorId);

    @Query("""
       SELECT MONTH(e.createdAt) AS month,
              COUNT(e.id) AS totalEnrollment
       FROM EnrollmentsEntity e
       WHERE e.course.instructorId = :userId
         AND YEAR(e.createdAt) = :year
       GROUP BY MONTH(e.createdAt)
       ORDER BY MONTH(e.createdAt)
       """)
    List<Object[]> countEnrollmentsByMonth(@Param("userId") String userId,
                                           @Param("year") long year);

    @Query("SELECT c FROM CourseEntity c LEFT JOIN FETCH c.enrollments WHERE c.id IN :ids")
    List<CourseEntity> findAllByIdWithEnrollments(@Param("ids") List<String> ids);

    @Query("""
        SELECT c.id 
        FROM CourseEntity c
        WHERE c.instructorId = :userId
    """)
    List<String> findAllIdsByInstructorId(@Param("userId") String userId);

    Page<CourseEntity> findByInstructorIdAndStatusAndProgressStep(
            String instructorId,
            EnumCourseStatus status,
            EnumCourseProgressStep progressStep,
            Pageable pageable
    );
}
