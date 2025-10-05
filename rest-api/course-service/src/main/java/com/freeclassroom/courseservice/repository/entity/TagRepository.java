package com.freeclassroom.courseservice.repository.entity;

import com.freeclassroom.courseservice.entity.category.TagEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TagRepository extends JpaRepository<TagEntity, String> {
    List<TagEntity> findAllByCourses_Id(String courseId);
}
