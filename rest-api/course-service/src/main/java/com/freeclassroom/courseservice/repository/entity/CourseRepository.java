package com.freeclassroom.courseservice.repository.entity;

import com.freeclassroom.courseservice.entity.course.CourseEntity;
import com.freeclassroom.courseservice.dto.response.course.instructor.CourseLessonCountProjection;
import com.freeclassroom.courseservice.dto.response.admin.AdminActiveCourseProjection;
import com.freeclassroom.courseservice.dto.response.course.instructor.InstructorCourseRowProjection;
import com.freeclassroom.courseservice.dto.response.course.instructor.InstructorCourseStatsProjection;
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
    @Query("""
        SELECT COUNT(c)
        FROM CourseEntity c
        WHERE c.status = com.freeclassroom.courseservice.enums.entity.EnumCourseStatus.PUBLISHED
          AND c.progressStep = com.freeclassroom.courseservice.enums.entity.EnumCourseProgressStep.COMPLETED
          AND c.deleted = false
    """)
    Long countActiveCoursesForAdmin();

    @Query("""
        SELECT COUNT(DISTINCT c.instructorId)
        FROM CourseEntity c
        WHERE c.status = com.freeclassroom.courseservice.enums.entity.EnumCourseStatus.PUBLISHED
          AND c.progressStep = com.freeclassroom.courseservice.enums.entity.EnumCourseProgressStep.COMPLETED
          AND c.deleted = false
    """)
    Long countActiveInstructorsForAdmin();

    @Query("""
        SELECT COUNT(c)
        FROM CourseEntity c
        WHERE c.status = :status
          AND c.deleted = false
    """)
    Long countByStatusForAdmin(@Param("status") EnumCourseStatus status);

    @Query("""
        SELECT
            c.id AS courseId,
            c.instructorId AS instructorId,
            c.title AS title,
            c.thumbnailUrl AS thumbnailUrl,
            COALESCE(c.rating, 0) AS rating,
            COUNT(e.id) AS studentCount
        FROM CourseEntity c
        LEFT JOIN c.enrollments e
        WHERE c.status = com.freeclassroom.courseservice.enums.entity.EnumCourseStatus.PUBLISHED
          AND c.progressStep = com.freeclassroom.courseservice.enums.entity.EnumCourseProgressStep.COMPLETED
          AND c.deleted = false
        GROUP BY c.id, c.instructorId, c.title, c.thumbnailUrl, c.rating
    """)
    List<AdminActiveCourseProjection> findActiveAdminCourseStats();

    @Query("""
        SELECT c.id
        FROM CourseEntity c
        WHERE c.status = com.freeclassroom.courseservice.enums.entity.EnumCourseStatus.PUBLISHED
          AND c.progressStep = com.freeclassroom.courseservice.enums.entity.EnumCourseProgressStep.COMPLETED
          AND c.deleted = false
    """)
    List<String> findActiveCourseIdsForAdmin();

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

    @Query("""
       SELECT MONTH(e.createdAt) AS month,
              COUNT(e.id) AS totalEnrollment
       FROM EnrollmentsEntity e
       WHERE e.course.instructorId = :instructorId
         AND YEAR(e.createdAt) = :year
       GROUP BY MONTH(e.createdAt)
       ORDER BY MONTH(e.createdAt)
       """)
    List<Object[]> countEnrollmentsByMonthForInstructor(@Param("instructorId") String instructorId,
                                                         @Param("year") int year);

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

    @EntityGraph(attributePaths = {"chapters"})
    @Query("""
        SELECT c FROM CourseEntity c LEFT JOIN FETCH c.chapters ch WHERE c.id = :id ORDER BY ch.position ASC
    """)
    Optional<CourseEntity> findByIdWithChaptersSorted(@Param("id") String id);

    @EntityGraph(attributePaths = {"tags", "category"})
    @Query("select c from CourseEntity c")
    Page<CourseEntity> findAllWithTags(Pageable pageable);

    @Query("""
        SELECT c
        FROM CourseEntity c
        WHERE c.deleted = false
          AND (:search IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:status IS NULL OR c.status = :status)
    """)
    Page<CourseEntity> findAllForAdmin(
            @Param("search") String search,
            @Param("status") EnumCourseStatus status,
            Pageable pageable
    );

    @Query("""
        SELECT
            c.id AS id,
            c.title AS title,
            c.shortDescription AS shortDescription,
            c.thumbnailUrl AS thumbnailUrl,
            c.originalPrice AS originalPrice,
            c.finalPrice AS finalPrice,
            c.rating AS rating,
            c.createdAt AS createdAt,
            COUNT(e.id) AS studentsCount
        FROM CourseEntity c
        LEFT JOIN c.enrollments e
        WHERE c.instructorId = :instructorId
          AND c.status = com.freeclassroom.courseservice.enums.entity.EnumCourseStatus.PUBLISHED
          AND c.progressStep = com.freeclassroom.courseservice.enums.entity.EnumCourseProgressStep.COMPLETED
          AND (:search IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')))
        GROUP BY c.id, c.title, c.shortDescription, c.thumbnailUrl, c.originalPrice, c.finalPrice, c.rating, c.createdAt
    """)
    Page<InstructorCourseRowProjection> findPublicInstructorCourses(
            @Param("instructorId") String instructorId,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("""
        SELECT
            c.id AS id,
            c.title AS title,
            c.shortDescription AS shortDescription,
            c.thumbnailUrl AS thumbnailUrl,
            c.originalPrice AS originalPrice,
            c.finalPrice AS finalPrice,
            c.rating AS rating,
            c.createdAt AS createdAt,
            COUNT(e.id) AS studentsCount
        FROM CourseEntity c
        LEFT JOIN c.enrollments e
        WHERE c.instructorId = :instructorId
          AND c.status = com.freeclassroom.courseservice.enums.entity.EnumCourseStatus.PUBLISHED
          AND c.progressStep = com.freeclassroom.courseservice.enums.entity.EnumCourseProgressStep.COMPLETED
          AND (:search IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')))
        GROUP BY c.id, c.title, c.shortDescription, c.thumbnailUrl, c.originalPrice, c.finalPrice, c.rating, c.createdAt
        ORDER BY COUNT(e.id) DESC, c.createdAt DESC
    """)
    Page<InstructorCourseRowProjection> findPublicInstructorCoursesOrderByStudentsDesc(
            @Param("instructorId") String instructorId,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("""
        SELECT
            c.id AS id,
            c.title AS title,
            c.shortDescription AS shortDescription,
            c.thumbnailUrl AS thumbnailUrl,
            c.originalPrice AS originalPrice,
            c.finalPrice AS finalPrice,
            c.rating AS rating,
            c.createdAt AS createdAt,
            COUNT(e.id) AS studentsCount
        FROM CourseEntity c
        LEFT JOIN c.enrollments e
        WHERE c.instructorId = :instructorId
          AND c.status = com.freeclassroom.courseservice.enums.entity.EnumCourseStatus.PUBLISHED
          AND c.progressStep = com.freeclassroom.courseservice.enums.entity.EnumCourseProgressStep.COMPLETED
          AND (:search IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')))
        GROUP BY c.id, c.title, c.shortDescription, c.thumbnailUrl, c.originalPrice, c.finalPrice, c.rating, c.createdAt
        ORDER BY COUNT(e.id) ASC, c.createdAt ASC
    """)
    Page<InstructorCourseRowProjection> findPublicInstructorCoursesOrderByStudentsAsc(
            @Param("instructorId") String instructorId,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("""
        SELECT
            COUNT(c.id) AS totalCourses,
            AVG(c.rating) AS averageRating
        FROM CourseEntity c
        WHERE c.instructorId = :instructorId
          AND c.status = com.freeclassroom.courseservice.enums.entity.EnumCourseStatus.PUBLISHED
          AND c.progressStep = com.freeclassroom.courseservice.enums.entity.EnumCourseProgressStep.COMPLETED
    """)
    InstructorCourseStatsProjection getPublicInstructorCourseStats(@Param("instructorId") String instructorId);

    @Query("""
        SELECT
            c.id AS courseId,
            COUNT(l.id) AS lessonsCount
        FROM CourseEntity c
        LEFT JOIN c.chapters ch
        LEFT JOIN ch.lessons l
        WHERE c.id IN :courseIds
          AND (l.id IS NULL OR l.deleted = false)
        GROUP BY c.id
    """)
    List<CourseLessonCountProjection> countLessonsByCourseIds(@Param("courseIds") List<String> courseIds);
}
