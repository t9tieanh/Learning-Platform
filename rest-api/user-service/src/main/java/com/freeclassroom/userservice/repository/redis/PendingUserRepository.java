package com.freeclassroom.userservice.repository.redis;
import com.freeclassroom.userservice.entity.redis.PendingUserEntity;
import org.springframework.data.repository.CrudRepository;

public interface PendingUserRepository extends CrudRepository<PendingUserEntity, String> {

}
