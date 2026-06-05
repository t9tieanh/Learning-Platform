package com.freeclassroom.courseservice.sagas;

import com.freeclassroom.courseservice.configuration.RabbitMQConfig;
import com.freeclassroom.courseservice.dto.event.CourseApprovalEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class CourseSearchIndexDlqConsumer {

    @RabbitListener(queues = RabbitMQConfig.COURSE_SEARCH_INDEX_DLQ)
    public void onDeadLetter(CourseApprovalEvent event) {
        log.error(
                "Course ES index DLQ received event: courseId={}, action={}. Manual replay or reindex may be required.",
                event != null ? event.getId() : null,
                event != null ? event.getAction() : null
        );
    }
}
