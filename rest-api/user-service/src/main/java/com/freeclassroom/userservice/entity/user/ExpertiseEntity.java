package com.freeclassroom.userservice.entity.user;

import com.freeclassroom.userservice.entity.AbstractEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor(force = true)
@Data
@SuperBuilder
@Table(name = "expertise")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ExpertiseEntity extends AbstractEntity {
    String  name;
    String  image;

    @ManyToMany(mappedBy = "expertises")
    List<UserEntity> users;
}
