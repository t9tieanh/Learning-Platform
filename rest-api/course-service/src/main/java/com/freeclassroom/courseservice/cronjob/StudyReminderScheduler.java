package com.freeclassroom.courseservice.cronjob;

import com.freeclassroom.courseservice.configuration.StudyReminderProperties;
import com.freeclassroom.courseservice.service.reminder.studyreminder.IStudyReminderService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicBoolean;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class StudyReminderScheduler {

    IStudyReminderService studyReminderService;
    StudyReminderProperties properties;

    private final AtomicBoolean running = new AtomicBoolean(false);

    @Scheduled(cron = "${app.study-reminder.cron:0 */5 * * * *}", zone = "${app.study-reminder.zone:Asia/Ho_Chi_Minh}")
    public void runDailyStudyReminder() {
        if (!running.compareAndSet(false, true)) {
            log.warn("[StudyReminder] Previous run still in progress — skipping");
            return;
        }

        log.info("[StudyReminder] Starting daily job (zone={})", properties.getZone());
        try {
            studyReminderService.sendDailyStudyReminders();
        } catch (Exception ex) {
            log.error("[StudyReminder] Job failed: {}", ex.getMessage(), ex);
        } finally {
            running.set(false);
        }
    }
}
