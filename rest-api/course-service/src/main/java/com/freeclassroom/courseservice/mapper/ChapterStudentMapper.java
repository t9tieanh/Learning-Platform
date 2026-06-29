package com.freeclassroom.courseservice.mapper;

import com.freeclassroom.courseservice.entity.course.ChapterEntity;
import com.freeclassroom.courseservice.dto.response.course.student.ChapterResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ChapterStudentMapper {
    @Mapping(target = "lessons", ignore = true)
    ChapterResponse toChapterResponse(ChapterEntity chapterEntity);
}
