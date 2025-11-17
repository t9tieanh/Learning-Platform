package com.freeclassroom.courseservice.repository.entity;

import com.freeclassroom.courseservice.entity.category.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryEntity, String> {
    @Query("""
        SELECT DISTINCT c
        FROM CategoryEntity c
        JOIN c.courses course
        WHERE course.status = 'PUBLISHED'
          AND course.progressStep = 'COMPLETED'
    """)
    List<CategoryEntity> findAllWithPublishedAndCompletedCourses();
}
