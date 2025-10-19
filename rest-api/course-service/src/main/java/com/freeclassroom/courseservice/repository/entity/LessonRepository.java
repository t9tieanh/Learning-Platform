package com.freeclassroom.courseservice.repository.entity;

import com.freeclassroom.courseservice.entity.course.LessonEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonRepository extends JpaRepository<LessonEntity,String> {
}
