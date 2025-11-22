package com.freeclassroom.courseservice.mapper;

import com.freeclassroom.courseservice.dto.request.comment.CommentRequest;
import com.freeclassroom.courseservice.dto.response.comment.CommentResponse;
import com.freeclassroom.courseservice.entity.comment.CommentEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CommentMapper {
    CommentResponse toDto(CommentEntity entity);
    CommentEntity toEntity(CommentRequest dto);
}
