package com.freeclassroom.userservice.entity.role;

import com.freeclassroom.userservice.entity.AbstractEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Entity
@AllArgsConstructor
@NoArgsConstructor(force = true)
@Data
@SuperBuilder
@Table(name = "roles")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleEntity extends AbstractEntity {
    String name;
    String description;
}
