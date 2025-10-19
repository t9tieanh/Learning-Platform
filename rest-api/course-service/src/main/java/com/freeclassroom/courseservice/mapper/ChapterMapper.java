package com.freeclassroom.courseservice.mapper;

import com.freeclassroom.courseservice.dto.request.chapter.CreationChapterRequest;
import com.freeclassroom.courseservice.dto.response.chapter.ChapterDto;
import com.freeclassroom.courseservice.dto.response.course.ChapterResponse;
import com.freeclassroom.courseservice.entity.course.ChapterEntity;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ChapterMapper {
    ChapterResponse toDto(ChapterEntity entity);
    List<ChapterDto> toDtos(List<ChapterEntity> entities);
    ChapterEntity toEntity(CreationChapterRequest newChapter);
}
