package com.freeclassroom.courseservice.mapper;

import com.freeclassroom.courseservice.dto.request.course.CreationCourseRequest;
import com.freeclassroom.courseservice.dto.response.course.*;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;


import java.util.List;

@Mapper(componentModel = "spring", uses = {ChapterMapper.class, EnrollmentMapper.class})
public interface CourseMapper {
    CourseEntity toEntity(CreationCourseRequest request);

    @Mapping(target = "id", ignore = true)
    void toEntity(CreationCourseRequest request, @MappingTarget CourseEntity entity);

    @Mapping(
            target = "tags",
            expression = "java(entity.getTags().stream().map(tag -> tag.getName()).toList())"
    )
    @Mapping(target = "category",
            expression = "java(entity.getCategory() != null ? entity.getCategory().getName() : null)")
    @Mapping(source = "chapters", target = "chapters")
    @Mapping(source = "enrollments", target = "enrollments")
    CourseResponse toDto(CourseEntity entity);


    @Mapping(target = "category",
            expression = "java(entity.getCategory() != null ? entity.getCategory().getName() : null)")
    CourseUserResponse toUserDto(CourseEntity entity);

    List<CourseResponse> toDtoList(List<CourseEntity> entities);

    List<CourseListResponse> toListResponse(List<CourseEntity> entities);

    @Mapping(target = "category", ignore = true)
    CourseInfoResponse toInfoResponseDto(CourseEntity entity);

    CourseUserDetailResponse toResponseDto(CourseEntity entity);
}
