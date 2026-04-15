package com.freeclassroom.userservice.repository.entity;

import com.freeclassroom.userservice.entity.personalization.PersonalizationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PersonalizationRepository extends JpaRepository<PersonalizationEntity, String> {
    Optional<PersonalizationEntity> findByUserId(String userId);
}
