package com.freeclassroom.courseservice.repository.entity;

import com.freeclassroom.courseservice.entity.course.ChapterEntity;
import feign.Param;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ChapterRepository extends JpaRepository<ChapterEntity, String> {
    @EntityGraph(attributePaths = {"lessons"})
    @Query("SELECT ch FROM ChapterEntity ch WHERE ch.id = :id")
    Optional<ChapterEntity> findByIdWithLessons(@Param("id") String id);

    @EntityGraph(attributePaths = {"lessons"})
    List<ChapterEntity> findAllByCourseId(@Param("id") String id);

    @Query("SELECT c.course.instructorId FROM ChapterEntity c WHERE c.id = :chapterId")
    Optional<String> findInstructorIdByChapterId(@Param("chapterId") String chapterId);

    Optional<ChapterEntity> findById(String id);
}
