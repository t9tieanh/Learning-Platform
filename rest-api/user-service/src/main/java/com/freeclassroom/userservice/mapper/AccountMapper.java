package com.freeclassroom.userservice.mapper;

import com.freeclassroom.userservice.dto.request.UserCreationRequest;
import com.freeclassroom.userservice.dto.response.UserCreationResponse;
import com.freeclassroom.userservice.entity.account.AccountEntity;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface AccountMapper {
    AccountEntity toAccountEntity(UserCreationRequest request);
    UserCreationResponse toUserCreationResponse(AccountEntity accountEntity);
    void updateAccountResponse( AccountEntity accountEntity, @MappingTarget UserCreationResponse userCreationResponse);
    void updateAccountEntity (UserCreationRequest request, @MappingTarget AccountEntity accountEntity);
}
