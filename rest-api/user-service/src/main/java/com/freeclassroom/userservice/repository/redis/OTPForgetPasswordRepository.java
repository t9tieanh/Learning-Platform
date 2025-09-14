package com.freeclassroom.userservice.repository.redis;

import com.freeclassroom.userservice.entity.redis.OTPForgetPassword;
import org.springframework.data.repository.CrudRepository;

public interface OTPForgetPasswordRepository extends CrudRepository<OTPForgetPassword, String> {
}
