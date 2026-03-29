package com.freeclassroom.userservice.cronjob;

import com.freeclassroom.userservice.service.event.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EventPersistJob {
    private final EventService eventService;

//    @Scheduled(cron = "* */5 * * * *") // Every 5 minutes
//    public void persisEvents() {
//        eventService.persistEventToDatabase();
//    }
}
