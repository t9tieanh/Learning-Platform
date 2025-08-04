package com.freeclassroom.userservice.repository;

import com.freeclassroom.userservice.entity.account.AccountEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<AccountEntity,String> {
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    Optional<AccountEntity> findByUsername(String username);
    Optional<AccountEntity> findByEmail(String email);
}
