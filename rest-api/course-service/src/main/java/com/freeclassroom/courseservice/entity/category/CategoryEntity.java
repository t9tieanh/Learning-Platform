package com.freeclassroom.courseservice.entity.category;

import com.freeclassroom.courseservice.entity.AbstractEntity;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Where;

import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "categories")
@AllArgsConstructor
@NoArgsConstructor(force = true)
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Where(clause = "deleted = false")
public class CategoryEntity extends AbstractEntity {
    String name;
    String description;

    @OneToMany(mappedBy = "category")
    List<CourseEntity> courses;
}
