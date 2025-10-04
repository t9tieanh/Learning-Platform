package com.freeclassroom.courseservice.mapper;

import com.freeclassroom.courseservice.dto.request.course.CreationCourseRequest;
import com.freeclassroom.courseservice.dto.response.course.CourseResponse;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import com.freeclassroom.courseservice.entity.category.TagEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;


import java.util.List;

@Mapper(componentModel = "spring")
public interface CourseMapper {
    CourseEntity toEntity(CreationCourseRequest request);

    @Mapping(target = "id", ignore = true)
    void toEntity(CreationCourseRequest request, @MappingTarget CourseEntity entity);

    @Mapping(
            target = "tags",
            expression = "java(entity.getTags().stream().map(tag -> tag.getName()).toList())"
    )
    @Mapping(
            target = "chapterLst",
            expression = "java(entity.getChapterLst().stream().map(ch -> ch.getId()).toList())"
    )
    @Mapping(
            target = "enrollments",
            expression = "java(entity.getEnrollments().stream().map(en -> en.getId()).toList())"
    )
    CourseResponse toDto(CourseEntity entity);

    List<CourseResponse> toDtoList(List<CourseEntity> entities);
}
