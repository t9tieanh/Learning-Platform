package com.freeclassroom.courseservice.service.search;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class CourseSearchMigrationRunner implements ApplicationRunner {

    private final CourseSearchMigrationService migrationService;

    @Value("${app.migration.elasticsearch.enabled:true}")
    private boolean enabled;

    @Value("${app.migration.elasticsearch.fail-fast:false}")
    private boolean failFast;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (!enabled) {
            log.info("Course ES migration is disabled (app.migration.elasticsearch.enabled=false)");
            return;
        }

        log.info("Starting startup migration: courses (full document) -> Elasticsearch");
        try {
            migrationService.migrateAllCoursesIdAndTags();
        } catch (Exception ex) {
            if (failFast) {
                log.error("Course ES migration failed and fail-fast is enabled. Aborting startup.", ex);
                throw ex;
            }
            log.error("Course ES migration failed (ignored because fail-fast=false).", ex);
        }
    }
}
