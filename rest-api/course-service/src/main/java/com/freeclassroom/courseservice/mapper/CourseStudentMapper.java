package com.freeclassroom.courseservice.mapper;

import com.freeclassroom.courseservice.dto.response.course.student.CourseDetailResponse;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {ChapterMapper.class, EnrollmentMapper.class})
public interface CourseStudentMapper {
    CourseDetailResponse toCourseDetailDto(CourseEntity entity);
}
