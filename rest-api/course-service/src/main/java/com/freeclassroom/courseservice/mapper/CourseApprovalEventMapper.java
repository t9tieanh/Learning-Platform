package com.freeclassroom.courseservice.mapper;

import com.freeclassroom.courseservice.dto.event.CourseApprovalEvent;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import com.freeclassroom.courseservice.enums.dto.CourseApprovalAction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface CourseApprovalEventMapper {
    CourseApprovalEventMapper INSTANCE = Mappers.getMapper(CourseApprovalEventMapper.class);

    CourseApprovalEvent toEvent(CourseEntity entity, CourseApprovalAction action, String reason);
}
