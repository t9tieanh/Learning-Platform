package com.freeclassroom.courseservice.entity.course;

import com.freeclassroom.courseservice.entity.AbstractEntity;
import com.freeclassroom.courseservice.entity.category.CategoryEntity;
import com.freeclassroom.courseservice.entity.member.EnrollmentsEntity;
import com.freeclassroom.courseservice.entity.category.TagEntity;
import com.freeclassroom.courseservice.enums.entity.EnumCourseProgressStep;
import com.freeclassroom.courseservice.enums.entity.EnumCourseStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.util.List;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "courses")
@AllArgsConstructor
@NoArgsConstructor(force = true)
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseEntity extends AbstractEntity {
    String title;
    String shortDescription;
    String longDescription;
    String thumbnailUrl;
    String language;
    Double originalPrice;
    Double finalPrice;

    @Enumerated(EnumType.STRING)
    EnumCourseStatus status;

    @Column(nullable = false)
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
    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    CategoryEntity category;

    @Enumerated(EnumType.STRING)
    EnumCourseProgressStep progressStep;

    //outcomes
    Set<String> outcomes;

    //requiment
    Set<String> requirements;
}