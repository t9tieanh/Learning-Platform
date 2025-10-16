package com.freeclassroom.courseservice.repository.entity;

import com.freeclassroom.courseservice.entity.course.ChapterEntity;
import feign.Param;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ChapterRepository extends JpaRepository<ChapterEntity, String> {
    @EntityGraph(attributePaths = {"lessons"})
    @Query("SELECT ch FROM ChapterEntity ch WHERE ch.id = :id")
    Optional<ChapterEntity> findByIdWithLessons(@Param("id") String id);

}
