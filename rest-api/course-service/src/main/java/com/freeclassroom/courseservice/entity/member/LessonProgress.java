package com.freeclassroom.courseservice.entity.member;

import com.freeclassroom.courseservice.entity.AbstractEntity;
import com.freeclassroom.courseservice.entity.course.LessonEntity;
import com.freeclassroom.courseservice.enums.entity.EnumLessonProgress;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@Entity
@Table(name = "lesson_progresss")
@AllArgsConstructor
@NoArgsConstructor(force = true)
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LessonProgress extends AbstractEntity {
    EnumLessonProgress progress;

    // Lesson
    @ManyToOne
    @JoinColumn(name = "lesson_id")
    LessonEntity lesson;

    // Enrollment
    @ManyToOne
    @JoinColumn(name = "enrollment_id")
    EnrollmentsEntity enrollment;
}
