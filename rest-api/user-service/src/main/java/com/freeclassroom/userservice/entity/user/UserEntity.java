package com.freeclassroom.userservice.entity.user;

import com.freeclassroom.userservice.entity.AbstractEntity;
import com.freeclassroom.userservice.entity.role.RoleEntity;
import com.freeclassroom.userservice.enums.entity.EnumAccountStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.util.HashSet;
import java.util.Set;

@Entity
@AllArgsConstructor
@NoArgsConstructor(force = true)
@Data
@SuperBuilder
@Table(name = "users")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserEntity extends AbstractEntity {
    String image;
    String name;
    String phone;
    String description;
    String position;
    String email;
    String username;
    String password;

    @Enumerated(EnumType.STRING)
    EnumAccountStatus status;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    Set<RoleEntity> roles = new HashSet<>();
}
