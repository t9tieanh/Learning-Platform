package com.freeclassroom.courseservice.mapper;

import com.freeclassroom.courseservice.dto.response.course.LessonResponse;
import com.freeclassroom.courseservice.entity.course.LessonEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface LessonMapper {
    LessonResponse toDto(LessonEntity entity);

}
