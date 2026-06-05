package com.freeclassroom.courseservice.sagas;

import com.freeclassroom.courseservice.configuration.CourseApprovalEsIndexProperties;
import com.freeclassroom.courseservice.configuration.RabbitMQConfig;
import com.freeclassroom.courseservice.dto.event.CourseApprovalEvent;
import com.freeclassroom.courseservice.service.search.CourseSearchIndexService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseApprovalSearchIndexConsumer {

    CourseSearchIndexService courseSearchIndexService;
    CourseApprovalEsIndexProperties esIndexProperties;

    @RabbitListener(
            queues = RabbitMQConfig.COURSE_SEARCH_INDEX_QUEUE,
            containerFactory = "courseSearchIndexListenerContainerFactory"
    )
    public void onCourseApproval(CourseApprovalEvent event) throws Exception {
        if (!esIndexProperties.isEnabled()) {
            log.debug("Course approval ES indexing is disabled; skipping course {}", event != null ? event.getId() : null);
            return;
        }

        try {
            courseSearchIndexService.handleApprovalEvent(event);
        } catch (Exception ex) {
            log.error(
                    "Course ES index failed for courseId={}, action={}: {}",
                    event.getId(),
                    event.getAction(),
                    ex.getMessage(),
                    ex
            );
            throw ex;
        }
    }
}
