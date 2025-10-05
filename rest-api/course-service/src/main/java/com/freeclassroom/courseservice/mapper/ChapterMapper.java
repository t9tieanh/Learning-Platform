package com.freeclassroom.courseservice.mapper;

import com.freeclassroom.courseservice.dto.response.course.ChapterResponse;
import com.freeclassroom.courseservice.entity.course.ChapterEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ChapterMapper {
    ChapterResponse toDto(ChapterEntity entity);
}
