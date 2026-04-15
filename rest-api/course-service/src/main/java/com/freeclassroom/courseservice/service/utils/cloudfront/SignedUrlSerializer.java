package com.freeclassroom.courseservice.service.utils.cloudfront;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Slf4j
public class SignedUrlSerializer extends JsonSerializer<String> {

    @Autowired
    @Lazy
    private ICloudFrontService cloudFrontService;

    @Override
    public void serialize(String value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        if (value == null || value.isBlank()) {
            gen.writeNull();
            return;
        }

        String objectKey = extractObjectKey(value);
        if (objectKey == null) {
            gen.writeString(value);
            return;
        }

        try {
            String signedUrl = cloudFrontService.getSignedUrl(objectKey);
            gen.writeString(signedUrl);
        } catch (Exception exception) {
            log.warn("Generate signed url failed for key: {}", objectKey, exception);
            gen.writeString(value);
        }
    }

    private String extractObjectKey(String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) {
            return null;
        }

        String value = rawUrl.trim();
        int queryIndex = value.indexOf('?');
        if (queryIndex >= 0) {
            value = value.substring(0, queryIndex);
        }

        int lastSlash = value.lastIndexOf('/');
        String objectKey = lastSlash >= 0 ? value.substring(lastSlash + 1) : value;

        return objectKey.isBlank() ? null : objectKey;
    }
}
