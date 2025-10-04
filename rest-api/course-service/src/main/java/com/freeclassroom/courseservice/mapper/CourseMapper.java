package com.freeclassroom.courseservice.mapper;

import com.freeclassroom.courseservice.dto.request.course.CreationCourseRequest;
import com.freeclassroom.courseservice.dto.response.course.CourseInfoResponse;
import com.freeclassroom.courseservice.dto.response.course.CourseResponse;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CourseMapper {
    CourseEntity toEntity(CreationCourseRequest request);

    @Mapping(target = "id", ignore = true)
    void toEntity(CreationCourseRequest request, @MappingTarget CourseEntity entity);

    CourseResponse toDto(CourseEntity entity);

    List<CourseResponse> toDtoList(List<CourseEntity> entities);

    @Mapping(target = "category", ignore = true)
    CourseInfoResponse toInfoResponseDto(CourseEntity entity);
}
