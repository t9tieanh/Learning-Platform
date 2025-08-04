package com.freeclassroom.userservice.entity.user;

import com.freeclassroom.userservice.entity.account.AccountEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Data
@Table(name = "student")
public class StudentEntity extends UserEntity {
    @OneToOne
    @JoinColumn(name = "account_id")
    AccountEntity account;
}
