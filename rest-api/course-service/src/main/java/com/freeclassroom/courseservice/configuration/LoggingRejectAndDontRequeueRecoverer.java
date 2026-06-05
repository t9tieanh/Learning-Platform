package com.freeclassroom.courseservice.configuration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.retry.MessageRecoverer;
import org.springframework.amqp.rabbit.retry.RejectAndDontRequeueRecoverer;

@Slf4j
public class LoggingRejectAndDontRequeueRecoverer implements MessageRecoverer {

    private final RejectAndDontRequeueRecoverer delegate = new RejectAndDontRequeueRecoverer();

    @Override
    public void recover(Message message, Throwable cause) {
        String body = message != null && message.getBody() != null
                ? new String(message.getBody())
                : null;
        log.error(
                "Course ES index exhausted all retries; moving to DLQ. messageBody={}",
                body,
                cause
        );
        delegate.recover(message, cause);
    }
}
