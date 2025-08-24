package com.freeclassroom.courseservice.entity;

import com.freeclassroom.courseservice.enums.EnumCourseStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "course")
@AllArgsConstructor
@NoArgsConstructor(force = true)
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseEntity extends AbstractEntity {
    String title;
    String description;
    String thumbnailUrl;
    String language;
    Double originalPrice;
    Double finalPrice;
    EnumCourseStatus status;
    String instructorId;

    // Chapter
    @OneToMany(mappedBy = "course")
    List<ChapterEntity> chapterLst;

    // Enrollment
    @OneToMany(mappedBy = "course")
    List<EnrollmentsEntity> enrollments;

    // Tag
    @ManyToMany
    @JoinTable(
            name = "course_tag",
            joinColumns = @JoinColumn(name = "course_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    List<TagEntity> tags;

    // Category
    @OneToMany(mappedBy = "course")
    List<CategoryEntity> categories;

}