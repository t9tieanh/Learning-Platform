package com.freeclassroom.courseservice.repository.entity;

import com.freeclassroom.courseservice.entity.course.CourseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<CourseEntity, String> {
    Optional<CourseEntity> findByIdAndInstructorId(String id, String instructorId);
    boolean existsByIdAndInstructorId(String id, String instructorId);

    Page<CourseEntity> findByInstructorId(String instructorId, Pageable pageable);
}
