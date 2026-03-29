package com.freeclassroom.userservice.infrastructure.redis;

import org.springframework.stereotype.Component;

/**
 * V2: personalization is stored only for authenticated USERs.
 * Guest consumers (V1) were removed.
 */
@Component
public class GuestEventConsumer {
    // no-op
}
