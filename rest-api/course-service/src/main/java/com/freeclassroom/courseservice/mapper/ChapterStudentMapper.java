package com.freeclassroom.courseservice.mapper;

import com.freeclassroom.courseservice.entity.course.ChapterEntity;
import com.freeclassroom.courseservice.dto.response.course.student.ChapterResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ChapterStudentMapper {
    ChapterResponse toChapterResponse(ChapterEntity chapterEntity);
}
