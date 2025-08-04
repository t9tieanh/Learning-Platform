package com.freeclassroom.userservice.repository;

import com.freeclassroom.userservice.entity.user.StudentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRespository extends JpaRepository<StudentEntity,String> {
}
