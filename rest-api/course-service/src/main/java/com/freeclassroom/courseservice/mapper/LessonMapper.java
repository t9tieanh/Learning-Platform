package com.freeclassroom.courseservice.mapper;

import com.freeclassroom.courseservice.dto.request.lesson.CreationDocumentRequest;
import com.freeclassroom.courseservice.dto.request.lesson.CreationVideoRequest;
import com.freeclassroom.courseservice.dto.response.course.LessonCourseAdminTeacherResponse;
import com.freeclassroom.courseservice.dto.response.course.LessonResponse;
import com.freeclassroom.courseservice.dto.response.lesson.LessonDto;
import com.freeclassroom.courseservice.entity.course.LessonEntity;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
@FieldDefaults(level = AccessLevel.PROTECTED)
@Slf4j
public abstract class LessonMapper {

    @Mapping(target = "resources", ignore = true)
    public abstract LessonResponse toResponse(LessonEntity entity);

    public abstract LessonDto toDto(LessonEntity entity);
    public abstract LessonEntity ToEntity(CreationVideoRequest lesson);
    public abstract LessonEntity ToEntity(CreationDocumentRequest lesson);
    public abstract LessonCourseAdminTeacherResponse toTeacherAdminResponse(LessonEntity entity);
}
