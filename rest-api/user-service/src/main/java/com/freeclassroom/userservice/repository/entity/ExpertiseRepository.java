package com.freeclassroom.userservice.repository.entity;

import com.freeclassroom.userservice.entity.user.ExpertiseEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpertiseRepository  extends JpaRepository<ExpertiseEntity, String> {
}
