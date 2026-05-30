package com.freeclassroom.courseservice.service.reminder;

import com.example.grpc.user.GetUserResponse;

public interface IReminderService {

    void sleep(long delayMs);

    void clearUserCache();

    GetUserResponse resolveUser(String userId);

    boolean publishEvent(Object event, String exchange, String routingKey);
}
