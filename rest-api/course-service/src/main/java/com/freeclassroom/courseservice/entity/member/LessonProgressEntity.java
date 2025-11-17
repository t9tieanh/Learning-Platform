package com.freeclassroom.courseservice.entity.member;

import com.freeclassroom.courseservice.entity.AbstractEntity;
import com.freeclassroom.courseservice.entity.course.LessonEntity;
import com.freeclassroom.courseservice.enums.entity.EnumLessonProgress;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@Entity
@Table(name = "lesson_progress")
@AllArgsConstructor
@NoArgsConstructor(force = true)
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LessonProgressEntity extends AbstractEntity {
    @Enumerated(EnumType.STRING)
    EnumLessonProgress progress;

    // Lesson
    @ManyToOne
    @JoinColumn(name = "lesson_id")
    LessonEntity lesson;

    // Enrollment
    @ManyToOne
    @JoinColumn(name = "enrollment_id")
    EnrollmentsEntity enrollment;

    @Column(columnDefinition = "TEXT")
    String note;
}
