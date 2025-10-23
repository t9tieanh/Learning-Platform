package com.freeclassroom.courseservice.mapper;

import com.freeclassroom.courseservice.dto.response.category.TagResponse;
import com.freeclassroom.courseservice.entity.category.TagEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TagMapper {
    TagResponse toDto(TagEntity entity);
}
