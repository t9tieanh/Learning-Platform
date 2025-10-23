package com.freeclassroom.userservice.repository.entity;

import com.freeclassroom.userservice.entity.role.RoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<RoleEntity, String> {
    RoleEntity findByName(String name);
}
