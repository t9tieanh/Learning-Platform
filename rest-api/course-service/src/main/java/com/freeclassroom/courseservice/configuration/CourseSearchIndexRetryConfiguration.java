package com.freeclassroom.courseservice.configuration;

import lombok.RequiredArgsConstructor;
import org.aopalliance.aop.Advice;
import org.springframework.amqp.rabbit.config.RetryInterceptorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.backoff.BackOffPolicy;

@Configuration
@RequiredArgsConstructor
public class CourseSearchIndexRetryConfiguration {

    private final CourseApprovalEsIndexProperties esIndexProperties;

    @Bean
    public Advice courseSearchIndexRetryAdvice() {
        return RetryInterceptorBuilder.stateless()
                .maxAttempts(esIndexProperties.getMaxAttempts())
                .backOffPolicy(courseSearchIndexBackOffPolicy())
                .recoverer(new LoggingRejectAndDontRequeueRecoverer())
                .build();
    }

    private BackOffPolicy courseSearchIndexBackOffPolicy() {
        LinearIncrementBackOffPolicy policy = new LinearIncrementBackOffPolicy();
        policy.setIncrementMs(esIndexProperties.getBackoffIncrementSeconds() * 1_000L);
        return policy;
    }
}
