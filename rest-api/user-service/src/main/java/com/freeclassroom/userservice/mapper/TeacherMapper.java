package com.freeclassroom.userservice.mapper;

import com.freeclassroom.userservice.dto.request.UserCreationRequest;
import com.freeclassroom.userservice.dto.response.UserCreationResponse;
import com.freeclassroom.userservice.dto.response.classroom.classdetail.TeacherResponse;
import com.freeclassroom.userservice.entity.user.TeacherEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TeacherMapper {
    TeacherEntity toTeacherEntity (UserCreationRequest request);
    UserCreationResponse toUserCreationResponse (TeacherEntity entity);
    TeacherResponse toTeacherResponse (TeacherEntity entity);
}
