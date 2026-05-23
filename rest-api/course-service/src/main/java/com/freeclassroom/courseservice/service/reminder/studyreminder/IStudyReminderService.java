package com.freeclassroom.courseservice.service.reminder.studyreminder;

import com.freeclassroom.courseservice.service.reminder.IReminderService;

public interface IStudyReminderService extends IReminderService {

    void sendDailyStudyReminders();
}
