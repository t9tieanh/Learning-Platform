package com.freeclassroom.userservice.entity.user;

import com.freeclassroom.userservice.entity.AbstractEntity;
import jakarta.persistence.MappedSuperclass;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@MappedSuperclass
@AllArgsConstructor
@NoArgsConstructor(force = true)
@Data
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserEntity extends AbstractEntity {
    String image;
    String name;
    String phone;
}
