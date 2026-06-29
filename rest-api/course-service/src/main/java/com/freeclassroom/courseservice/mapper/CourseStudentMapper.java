package com.freeclassroom.courseservice.mapper;

import com.freeclassroom.courseservice.dto.response.course.student.CourseDetailResponse;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {ChapterMapper.class, EnrollmentMapper.class})
public interface CourseStudentMapper {
    @Mapping(target = "chapters", ignore = true)
    CourseDetailResponse toCourseDetailDto(CourseEntity entity);
}
