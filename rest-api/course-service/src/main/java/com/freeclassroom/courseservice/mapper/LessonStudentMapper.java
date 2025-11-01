package com.freeclassroom.courseservice.mapper;

import com.freeclassroom.courseservice.dto.response.course.student.LessonOverviewResponse;
import com.freeclassroom.courseservice.entity.course.LessonEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface LessonStudentMapper {
    LessonOverviewResponse toLessonOverviewResponse(LessonEntity lessonEntity);
}
