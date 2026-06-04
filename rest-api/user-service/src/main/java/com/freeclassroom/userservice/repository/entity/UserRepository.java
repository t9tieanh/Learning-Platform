package com.freeclassroom.userservice.repository.entity;

import com.freeclassroom.userservice.entity.user.UserEntity;
import feign.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, String> {
    Optional<UserEntity> findByUsername(String username);
    Optional<UserEntity> findByEmail(String email);

    @Query("SELECT u FROM UserEntity u WHERE u.email = :input OR u.username = :input")
    Optional<UserEntity> findFirstByEmailOrUsername(@Param("input") String input);


    boolean existsByUsernameOrEmail(String username, String email);
    boolean existsByUsername(String s);
    boolean existsByEmail(String s);

    @Query("SELECT u FROM UserEntity u LEFT JOIN FETCH u.expertises WHERE u.id = :id")
    Optional<UserEntity> findByIdWithExpertises(@Param("id") String id);

    @Query("""
        SELECT u
        FROM UserEntity u
        WHERE u.id IN :userIds
          AND (
            :search = ''
            OR LOWER(COALESCE(u.name, '')) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(COALESCE(u.email, '')) LIKE LOWER(CONCAT('%', :search, '%'))
          )
        ORDER BY LOWER(COALESCE(u.name, '')) ASC, u.id ASC
    """)
    Page<UserEntity> searchTeachersByIdsOrderByNameAsc(@Param("userIds") List<String> userIds,
                                                       @Param("search") String search,
                                                       Pageable pageable);

    @Query("""
        SELECT u
        FROM UserEntity u
        WHERE u.id IN :userIds
          AND (
            :search = ''
            OR LOWER(COALESCE(u.name, '')) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(COALESCE(u.email, '')) LIKE LOWER(CONCAT('%', :search, '%'))
          )
        ORDER BY LOWER(COALESCE(u.name, '')) DESC, u.id DESC
    """)
    Page<UserEntity> searchTeachersByIdsOrderByNameDesc(@Param("userIds") List<String> userIds,
                                                        @Param("search") String search,
                                                        Pageable pageable);
}
