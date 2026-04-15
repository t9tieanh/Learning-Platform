package com.freeclassroom.userservice.service.event;

import com.freeclassroom.userservice.dto.request.auth.Identity;
import com.freeclassroom.userservice.dto.request.personal.TrackingEventRequest;
import org.springframework.data.redis.connection.stream.RecordId;

public interface IEventService {
    void persistEventToDatabase();
    void mergeGuestEventsToUser(String guestId, String userId);
    RecordId saveEventToRedis(Identity identity, TrackingEventRequest trackingEvent);
}
