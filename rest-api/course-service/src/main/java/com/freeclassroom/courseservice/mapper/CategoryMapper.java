package com.freeclassroom.courseservice.mapper;

import com.freeclassroom.courseservice.dto.response.category.CategoryResponse;
import com.freeclassroom.courseservice.entity.category.CategoryEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryResponse toDto(CategoryEntity entity);
}
