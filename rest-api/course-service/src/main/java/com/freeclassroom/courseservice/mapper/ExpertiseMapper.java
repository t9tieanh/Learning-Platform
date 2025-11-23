package com.freeclassroom.courseservice.mapper;

import com.example.grpc.user.Expertise;
import com.freeclassroom.courseservice.dto.response.course.ExpertiseResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ExpertiseMapper {
    ExpertiseResponse toResponse(Expertise expertise);
}
