package com.freeclassroom.courseservice.mapper;

import com.freeclassroom.courseservice.dto.request.lesson.CreationDocumentRequest;
import com.freeclassroom.courseservice.dto.request.lesson.CreationVideoRequest;
import com.freeclassroom.courseservice.dto.response.course.LessonResponse;
import com.freeclassroom.courseservice.dto.response.lesson.LessonDto;
import com.freeclassroom.courseservice.entity.course.LessonEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface LessonMapper {
    LessonResponse toResponse(LessonEntity entity);
    LessonDto toDto(LessonEntity entity);
    LessonEntity ToEntity(CreationVideoRequest lesson);
    LessonEntity ToEntity(CreationDocumentRequest lesson);
}
