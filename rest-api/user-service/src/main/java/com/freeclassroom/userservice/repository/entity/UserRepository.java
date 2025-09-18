package com.freeclassroom.userservice.repository.entity;

import com.freeclassroom.userservice.entity.user.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, String> {
    Optional<UserEntity> findByUsername(String username);

    @Query("SELECT u FROM UserEntity u WHERE u.email = :input OR u.username = :input")
    Optional<UserEntity> findByEmailOrUsername(String input);

    boolean existsByUsernameOrEmail(String username, String email);
    boolean existsByUsername(String s);
    boolean existsByEmail(String s);
}
