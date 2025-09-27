package com.freeclassroom.courseservice.repository.entity;

import com.freeclassroom.courseservice.entity.category.TagEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TagRepository extends JpaRepository<TagEntity, String> {
}
