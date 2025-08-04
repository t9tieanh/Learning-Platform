package com.freeclassroom.userservice.mapper;

import com.freeclassroom.userservice.dto.request.UserCreationRequest;
import com.freeclassroom.userservice.dto.response.UserCreationResponse;
import com.freeclassroom.userservice.entity.user.StudentEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface StudentMapper {
    StudentEntity toStudentEntity(UserCreationRequest request);

    UserCreationResponse toUserCreationResponse(StudentEntity studentEntity);
}
