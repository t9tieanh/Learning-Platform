package com.freeclassroom.userservice.mapper.expertise;

import com.freeclassroom.userservice.dto.request.expertise.CreationExpertiseRequest;
import com.freeclassroom.userservice.entity.user.ExpertiseEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ExpertiseMapper {
    ExpertiseEntity toEntity(CreationExpertiseRequest request);
}
