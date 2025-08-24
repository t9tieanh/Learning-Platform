package com.freeclassroom.courseservice.entity.course;

import com.freeclassroom.courseservice.entity.AbstractEntity;
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
@Table(name = "resources")
@AllArgsConstructor
@NoArgsConstructor(force = true)
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ResourceEntity extends AbstractEntity {
    String type;
    String url;

    @ManyToOne
    @JoinColumn(name = "lesson_id")
    LessonEntity lesson;
}
