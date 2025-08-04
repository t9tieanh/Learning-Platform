package com.freeclassroom.userservice.entity.account;

import com.freeclassroom.userservice.entity.AbstractEntity;
import com.freeclassroom.userservice.entity.user.StudentEntity;
import com.freeclassroom.userservice.entity.user.TeacherEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Data
//@AllArgsConstructor
//@NoArgsConstructor
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "account")
public class AccountEntity extends AbstractEntity {
    String username;
    String password;
    String email;
    String ggId;
    EnumRole role;
    EnumAccountStatus status;

    public AccountEntity() {
        super();
    }

    @OneToOne(mappedBy = "account", cascade = CascadeType.ALL)
    StudentEntity student;

    @OneToOne(mappedBy = "account", cascade = CascadeType.ALL)
    TeacherEntity teacher;
}
