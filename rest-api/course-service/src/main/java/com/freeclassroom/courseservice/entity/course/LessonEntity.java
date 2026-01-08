package com.freeclassroom.courseservice.entity.course;

import com.freeclassroom.courseservice.entity.AbstractEntity;
import com.freeclassroom.courseservice.entity.member.LessonProgressEntity;
import com.freeclassroom.courseservice.enums.entity.EnumLessonType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Where;

import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "lessons")
@AllArgsConstructor
@NoArgsConstructor(force = true)
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Where(clause = "deleted = false")
public class LessonEntity extends AbstractEntity {
    String title;

    @Column(columnDefinition = "TEXT")
    String content;
    Long duration;
    Long position;
    Boolean isPublic;

    @Enumerated(EnumType.STRING)
    EnumLessonType type;
    String url;
    // Chapter
    @ManyToOne
    @JoinColumn(name = "chapter_id")
    ChapterEntity chapter;

    // Lesson Progress
    @OneToMany(mappedBy = "lesson")
    List<LessonProgressEntity> progresses;
}
