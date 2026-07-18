package com.freeclassroom.userservice.infrastructure.elasticsearch;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Creates the user personalization signals index on startup so the first write from
 * RedisToElasticsearchSyncJob lands on an index with the right mapping instead of
 * letting Elasticsearch auto-create one with guessed types.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UserSignalsIndexBootstrapRunner implements ApplicationRunner {

    private final TrackingEventIndexService trackingEventIndexService;

    @Value("${app.migration.elasticsearch.enabled:true}")
    private boolean enabled;

    @Value("${app.migration.elasticsearch.fail-fast:false}")
    private boolean failFast;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (!enabled) {
            log.info("User signals ES index bootstrap is disabled (app.migration.elasticsearch.enabled=false)");
            return;
        }

        log.info("Starting startup bootstrap: Elasticsearch index '{}'", trackingEventIndexService.indexName());
        try {
            trackingEventIndexService.ensureIndexExists();
            log.info("User signals ES index bootstrap finished for index '{}'", trackingEventIndexService.indexName());
        } catch (Exception ex) {
            if (failFast) {
                log.error("User signals ES index bootstrap failed and fail-fast is enabled. Aborting startup.", ex);
                throw ex;
            }
            log.error("User signals ES index bootstrap failed (ignored because fail-fast=false).", ex);
        }
    }
}
