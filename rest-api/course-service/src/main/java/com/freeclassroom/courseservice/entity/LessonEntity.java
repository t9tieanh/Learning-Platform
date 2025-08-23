package com.freeclassroom.courseservice.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "lesson")
@AllArgsConstructor
@NoArgsConstructor(force = true)
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LessonEntity extends AbstractEntity{
    String title;
    String content;
    Long duration;
    Long position;
    Boolean isPublic;

    // Chapter
    @ManyToOne
    @JoinColumn(name = "chapter_id")
    ChapterEntity chapter;

    // Lesson Progress
    @OneToMany(mappedBy = "lesson")
    List<LessonProgress> progresses;

    // Resource
    @OneToMany(mappedBy = "lesson")
    List<ResourceEntity> resourceLst;
}
