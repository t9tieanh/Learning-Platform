package com.freeclassroom.courseservice.entity;

import com.freeclassroom.courseservice.enums.EnumCompletionStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "enrollment")
@AllArgsConstructor
@NoArgsConstructor(force = true)
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EnrollmentsEntity extends AbstractEntity {
    String userId;
    LocalDateTime enrollmentDate;
    EnumCompletionStatus status;
    Double progress;

    // Course
    @ManyToOne
    @JoinColumn(name = "course_id")
    CourseEntity course;

    // Lesson Progress
    @OneToMany(mappedBy = "enrollment")
    List<LessonProgress> progresses;
}

