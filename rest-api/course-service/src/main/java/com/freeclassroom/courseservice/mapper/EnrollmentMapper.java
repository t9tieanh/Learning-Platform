package com.freeclassroom.courseservice.mapper;

import com.freeclassroom.courseservice.dto.response.member.EnrollmentResponse;
import com.freeclassroom.courseservice.entity.member.EnrollmentsEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EnrollmentMapper {
    EnrollmentResponse toDto(EnrollmentsEntity entity);
}
