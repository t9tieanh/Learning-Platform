package com.freeclassroom.userservice.mapper.user;

import com.freeclassroom.userservice.dto.request.user.CreationUserRequest;
import com.freeclassroom.userservice.entity.redis.PendingUserEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    PendingUserEntity toEntity(CreationUserRequest request);
}
