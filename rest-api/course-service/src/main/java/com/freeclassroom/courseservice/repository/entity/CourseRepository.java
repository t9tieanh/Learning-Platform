package com.freeclassroom.courseservice.repository.entity;

import com.freeclassroom.courseservice.entity.course.CourseEntity;
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
}
