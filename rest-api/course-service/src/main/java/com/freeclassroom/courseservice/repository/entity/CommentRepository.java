package com.freeclassroom.courseservice.repository.entity;

import com.freeclassroom.courseservice.entity.comment.CommentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<CommentEntity, String> {
    @Query("SELECT c FROM CommentEntity c WHERE c.lessonId = :lessonId ORDER BY c.createdAt DESC")
    List<CommentEntity> findByLessonIdOrderByCreatedAtAsc(String lessonId);

    @Query
    List<CommentEntity> findByParentId(String parentId);
}
