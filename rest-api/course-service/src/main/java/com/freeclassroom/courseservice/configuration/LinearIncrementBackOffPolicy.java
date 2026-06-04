package com.freeclassroom.courseservice.configuration;

import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.retry.RetryContext;
import org.springframework.retry.backoff.BackOffContext;
import org.springframework.retry.backoff.BackOffPolicy;

import java.io.Serial;
import java.io.Serializable;

/**
 * Linear backoff: delay before retry attempt n is (n * incrementMs).
 * Example with incrementMs=10_000: 10s, 20s, 30s, 40s, 50s.
 */
@Slf4j
@Setter
public class LinearIncrementBackOffPolicy implements BackOffPolicy, Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private long incrementMs = 10_000L;

    @Override
    public BackOffContext start(RetryContext context) {
        return new LinearIncrementBackOffContext();
    }

    @Override
    public synchronized void backOff(BackOffContext backOffContext) {
        LinearIncrementBackOffContext context = (LinearIncrementBackOffContext) backOffContext;
        long delayMs = (long) (context.getRetryCount() + 1) * incrementMs;
        log.warn(
                "Course ES index consumer backing off {}ms before retry #{}",
                delayMs,
                context.getRetryCount() + 2
        );
        try {
            Thread.sleep(delayMs);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Course ES index retry backoff interrupted", ex);
        }
        context.increment();
    }

    private static final class LinearIncrementBackOffContext implements BackOffContext, Serializable {

        @Serial
        private static final long serialVersionUID = 1L;

        private int retryCount;

        int getRetryCount() {
            return retryCount;
        }

        void increment() {
            retryCount++;
        }
    }
}
