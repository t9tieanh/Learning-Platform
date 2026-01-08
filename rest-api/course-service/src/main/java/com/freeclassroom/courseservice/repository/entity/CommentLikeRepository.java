package com.freeclassroom.courseservice.repository.entity;

import com.freeclassroom.courseservice.entity.comment.CommentLikeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentLikeRepository extends JpaRepository<CommentLikeEntity, String> {
}
