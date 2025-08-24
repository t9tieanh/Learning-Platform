package com.freeclassroom.courseservice.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "tag")
@AllArgsConstructor
@NoArgsConstructor(force = true)
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TagEntity extends AbstractEntity{
    String name;
    String imageUrl;

    @ManyToMany(mappedBy = "tags")
    List<CourseEntity> courses;
}
