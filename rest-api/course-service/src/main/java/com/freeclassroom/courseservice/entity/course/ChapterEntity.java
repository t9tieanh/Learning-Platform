package com.freeclassroom.courseservice.entity.course;

import com.freeclassroom.courseservice.entity.AbstractEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Where;

import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "chapters")
@AllArgsConstructor
@NoArgsConstructor(force = true)
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Where(clause = "deleted = false")
public class ChapterEntity extends AbstractEntity {
    String title;
    String description;
    Long position;
    Boolean isOpen;

    // Course
    @ManyToOne
    @JoinColumn(name = "course_id")
    CourseEntity course;

    // Lesson
    @OneToMany(mappedBy = "chapter", cascade = CascadeType.ALL, orphanRemoval = true)
    List<LessonEntity> lessons;

    public void prePersist() {
        if (isOpen == null) {
            isOpen = false;
        }
    }
}
