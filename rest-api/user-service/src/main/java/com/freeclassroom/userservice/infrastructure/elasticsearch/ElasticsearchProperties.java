package com.freeclassroom.userservice.infrastructure.elasticsearch;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "elasticsearch")
public class ElasticsearchProperties {
    /** Example: http://localhost:9200 */
    private String url;

    private Index index = new Index();

    @Data
    public static class Index {
        /** Index for user personalization signals (course_score, tag_score, last_action). */
        @Value("${elasticsearch.index.tracking-events:user-personalization-signals}")
        private String trackingEvents;

        /** Index for courses catalog (courseId + tags). */
        @Value("${elasticsearch.index.courses:courses}")
        private String courses;
    }
}
