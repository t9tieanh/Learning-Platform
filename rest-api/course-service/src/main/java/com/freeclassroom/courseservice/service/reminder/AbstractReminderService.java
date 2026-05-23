package com.freeclassroom.courseservice.service.reminder;

import com.example.grpc.user.GetUserResponse;
import com.freeclassroom.courseservice.grpc.client.UserGrpcClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PROTECTED, makeFinal = true)
public abstract class AbstractReminderService implements IReminderService {

    UserGrpcClient userGrpcClient;
    RabbitTemplate rabbitTemplate;

    private final Map<String, GetUserResponse> userCache = new ConcurrentHashMap<>();

    @Override
    public void sleep(long delayMs) {
        if (delayMs <= 0) {
            return;
        }
        try {
            Thread.sleep(delayMs);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            log.warn("[Reminder] Batch delay interrupted");
        }
    }

    @Override
    public void clearUserCache() {
        userCache.clear();
    }

    @Override
    public GetUserResponse resolveUser(String userId) {
        if (userCache.containsKey(userId)) {
            return userCache.get(userId);
        }
        try {
            GetUserResponse user = userGrpcClient.getUser(userId);
            userCache.put(userId, user);
            return user;
        } catch (Exception ex) {
            log.error("[Reminder] Failed to load user {}: {}", userId, ex.getMessage());
            return null;
        }
    }

    @Override
    public boolean publishEvent(Object event, String exchange, String routingKey) {
        rabbitTemplate.convertAndSend(exchange, routingKey, event);
        return true;
    }
}
