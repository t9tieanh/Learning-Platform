package com.freeclassroom.userservice.entity.user;

import com.freeclassroom.userservice.entity.account.AccountEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "teacher")
public class TeacherEntity extends UserEntity {

    String description;
    String position;
    String email;

    @OneToOne
    @JoinColumn(name = "account_id")
    AccountEntity account;
}