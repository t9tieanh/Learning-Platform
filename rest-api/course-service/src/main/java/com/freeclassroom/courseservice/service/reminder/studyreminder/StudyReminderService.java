package com.freeclassroom.courseservice.service.reminder.studyreminder;

import com.example.grpc.user.GetUserResponse;
import com.freeclassroom.courseservice.configuration.RabbitMQConfig;
import com.freeclassroom.courseservice.configuration.StudyReminderProperties;
import com.freeclassroom.courseservice.dto.event.StudyReminderCourseItem;
import com.freeclassroom.courseservice.dto.event.StudyReminderEvent;
import com.freeclassroom.courseservice.entity.member.EnrollmentsEntity;
import com.freeclassroom.courseservice.enums.entity.EnumCompletionStatus;
import com.freeclassroom.courseservice.enums.entity.EnumCourseStatus;
import com.freeclassroom.courseservice.grpc.client.UserGrpcClient;
import com.freeclassroom.courseservice.repository.entity.EnrollmentRepository;
import com.freeclassroom.courseservice.service.reminder.AbstractReminderService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class StudyReminderService extends AbstractReminderService implements IStudyReminderService {

    StudyReminderProperties properties;
    EnrollmentRepository enrollmentRepository;

    public StudyReminderService(
            StudyReminderProperties properties,
            EnrollmentRepository enrollmentRepository,
            UserGrpcClient userGrpcClient,
            RabbitTemplate rabbitTemplate
    ) {
        super(userGrpcClient, rabbitTemplate);
        this.properties = properties;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Override
    public void sendDailyStudyReminders() {
        if (!properties.isEnabled()) {
            log.info("[StudyReminder] Job disabled via app.study-reminder.enabled=false");
            return;
        }

        clearUserCache();
        Map<String, List<StudyReminderCourseItem>> coursesByUser = loadCoursesByUser();
        if (coursesByUser.isEmpty()) {
            log.info("[StudyReminder] No active enrollments to remind");
            return;
        }

        List<String> userIds = new ArrayList<>(coursesByUser.keySet());
        int batchSize = Math.max(1, properties.getUserBatchSize());
        int published = 0;
        int skipped = 0;

        for (int offset = 0; offset < userIds.size(); offset += batchSize) {
            int end = Math.min(offset + batchSize, userIds.size());
            List<String> batch = userIds.subList(offset, end);

            for (String userId : batch) {
                if (publishReminderForUser(userId, coursesByUser.get(userId))) {
                    published++;
                } else {
                    skipped++;
                }
            }

            if (end < userIds.size() && properties.getBatchDelayMs() > 0) {
                sleep(properties.getBatchDelayMs());
            }
        }

        log.info(
                "[StudyReminder] Finished — users={}, published={}, skipped={}",
                userIds.size(),
                published,
                skipped
        );
    }

    private Map<String, List<StudyReminderCourseItem>> loadCoursesByUser() {
        Map<String, List<StudyReminderCourseItem>> coursesByUser = new LinkedHashMap<>();
        int pageIndex = 0;
        int pageSize = Math.max(1, properties.getEnrollmentPageSize());
        Page<EnrollmentsEntity> page;

        do {
            Pageable pageable = PageRequest.of(pageIndex++, pageSize);
            page = enrollmentRepository.findActiveEnrollmentsForStudyReminder(
                    EnumCourseStatus.PUBLISHED,
                    EnumCompletionStatus.COMPLETED,
                    pageable
            );

            for (EnrollmentsEntity enrollment : page.getContent()) {
                String userId = enrollment.getUserId();
                coursesByUser
                        .computeIfAbsent(userId, ignored -> new ArrayList<>())
                        .add(toCourseItem(enrollment));
            }
        } while (page.hasNext());

        return coursesByUser;
    }

    private boolean publishReminderForUser(String userId, List<StudyReminderCourseItem> courses) {
        if (courses == null || courses.isEmpty()) {
            return false;
        }

        GetUserResponse user = resolveUser(userId);
        if (user == null || !StringUtils.hasText(user.getEmail())) {
            log.warn("[StudyReminder] Skip user {} — missing profile or email", userId);
            return false;
        }

        StudyReminderEvent event = StudyReminderEvent.builder()
                .userId(userId)
                .userName(user.getName())
                .email(user.getEmail())
                .courses(courses)
                .build();

        publishEvent(
                event,
                RabbitMQConfig.USER_NOTIFICATION_EXCHANGE,
                RabbitMQConfig.STUDY_REMINDER_ROUTING_KEY
        );
        return true;
    }

    private StudyReminderCourseItem toCourseItem(EnrollmentsEntity enrollment) {
        var course = enrollment.getCourse();
        String baseUrl = properties.getFrontendBaseUrl().replaceAll("/+$", "");
        return StudyReminderCourseItem.builder()
                .courseId(course.getId())
                .title(course.getTitle())
                .thumbnailUrl(course.getThumbnailUrl())
                .progress(enrollment.getProgress())
                .courseUrl(baseUrl + "/course/" + course.getId())
                .build();
    }
}
