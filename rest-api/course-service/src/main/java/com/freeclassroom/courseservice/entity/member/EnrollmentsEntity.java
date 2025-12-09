package com.freeclassroom.courseservice.entity.member;

import com.freeclassroom.courseservice.entity.AbstractEntity;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import com.freeclassroom.courseservice.enums.entity.EnumCompletionStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Entity
@Table(
        name = "enrollments",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "course_id"})
        }
)
@AllArgsConstructor
@NoArgsConstructor(force = true)
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EnrollmentsEntity extends AbstractEntity {
    @Column(name = "user_id", nullable = false)
    String userId;

    LocalDateTime enrollmentDate;

    @Enumerated(EnumType.STRING)
    EnumCompletionStatus status;

    Double progress;

    // Course
    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    CourseEntity course;

    // Lesson Progress
    @OneToMany(mappedBy = "enrollment")
    List<LessonProgressEntity> progresses;
}

