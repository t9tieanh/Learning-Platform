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
@Table(name = "chapter")
@AllArgsConstructor
@NoArgsConstructor(force = true)
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChapterEntity extends AbstractEntity {
    String title;
    String description;
    Long position;

    // Course
    @ManyToOne
    @JoinColumn(name = "course_id")
    CourseEntity course;

    // Lesson
    @OneToMany(mappedBy = "chapter")
    List<LessonEntity> lessons;
}
