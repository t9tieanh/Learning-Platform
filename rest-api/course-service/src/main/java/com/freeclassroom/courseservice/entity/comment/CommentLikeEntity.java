package com.freeclassroom.courseservice.entity.comment;

import com.freeclassroom.courseservice.entity.AbstractEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@Entity
@Table(name = "comment_likes")
@AllArgsConstructor
@NoArgsConstructor(force = true)
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommentLikeEntity extends AbstractEntity {
    String commentId;
    String userId;
}
