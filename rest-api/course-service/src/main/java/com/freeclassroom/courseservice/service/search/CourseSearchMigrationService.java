package com.freeclassroom.courseservice.service.search;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.ElasticsearchException;
import co.elastic.clients.elasticsearch._types.mapping.Property;
import co.elastic.clients.elasticsearch.core.BulkRequest;
import co.elastic.clients.elasticsearch.core.BulkResponse;
import co.elastic.clients.elasticsearch.core.bulk.BulkOperation;
import com.freeclassroom.courseservice.dto.search.CourseEsDocument;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import com.freeclassroom.courseservice.repository.entity.CourseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseSearchMigrationService {

    private final ElasticsearchClient elasticsearchClient;
    private final CourseRepository courseRepository;

    @Value("${app.elasticsearch.course-index:courses}")
    private String indexName;

    @Value("${app.elasticsearch.user-personalization-signals-index:user-personalization-signals}")
    private String userPersonalizationSignalsIndexName;

    @Value("${app.migration.elasticsearch.batch-size:500}")
    private int batchSize;

    @Value("${app.migration.elasticsearch.create-index-if-missing:true}")
    private boolean createIndexIfMissing;

    @Value("${app.migration.elasticsearch.recreate-index-on-startup:false}")
    private boolean recreateIndexOnStartup;

    public void migrateAllCoursesIdAndTags() throws IOException {
        if (recreateIndexOnStartup) {
            recreateIndex();
            deleteUserPersonalizationSignalsIndex();
        } else if (createIndexIfMissing) {
            ensureIndexExists();
        }

        int pageNumber = 0;
        long totalIndexed = 0;

        while (true) {
            Pageable pageable = PageRequest.of(pageNumber, batchSize);
            Page<CourseEntity> page = courseRepository.findAllWithTags(pageable);
            if (page.isEmpty()) {
                break;
            }

            BulkResponse bulkResponse = bulkUpsertCourses(page.getContent());
            if (bulkResponse.errors()) {
                log.warn("Elasticsearch bulk had errors. Took: {}ms", bulkResponse.took());
            }

            totalIndexed += page.getNumberOfElements();
            log.info("Migrated courses to ES: {}/{} (page {})", totalIndexed, page.getTotalElements(), pageNumber);

            if (!page.hasNext()) {
                break;
            }
            pageNumber++;
        }

        log.info("Course migration finished. Total indexed: {} into index '{}'", totalIndexed, indexName);
    }

    private void recreateIndex() throws IOException {
        boolean exists = elasticsearchClient.indices().exists(e -> e.index(indexName)).value();
        if (exists) {
            log.info("Elasticsearch index '{}' found. Deleting for fresh migration...", indexName);
            elasticsearchClient.indices().delete(d -> d.index(indexName));
            log.info("Elasticsearch index '{}' deleted.", indexName);
        } else {
            log.info("Elasticsearch index '{}' not found. Will create a fresh one...", indexName);
        }

        elasticsearchClient.indices().create(c -> c
                .index(indexName)
                .mappings(m -> m
                        .properties("id", Property.of(p -> p.keyword(k -> k)))
                        .properties("title", Property.of(p -> p.text(t -> t.fields("keyword", k -> k.keyword(kk -> kk.ignoreAbove(256))))))
                        .properties("shortDescription", Property.of(p -> p.text(t -> t)))
                        .properties("longDescription", Property.of(p -> p.text(t -> t)))
                        .properties("thumbnailUrl", Property.of(p -> p.keyword(k -> k)))
                        .properties("introductoryVideo", Property.of(p -> p.keyword(k -> k)))
                        .properties("language", Property.of(p -> p.keyword(k -> k)))
                        .properties("originalPrice", Property.of(p -> p.double_(d -> d)))
                        .properties("finalPrice", Property.of(p -> p.double_(d -> d)))
                        .properties("rating", Property.of(p -> p.double_(d -> d)))
                        .properties("instructorId", Property.of(p -> p.keyword(k -> k)))
                        .properties("category", Property.of(p -> p.text(t -> t.fields("keyword", k -> k.keyword(kk -> kk.ignoreAbove(256))))))
                        .properties("createdAt", Property.of(p -> p.date(d -> d)))
                        .properties("status", Property.of(p -> p.keyword(k -> k)))
                        .properties("deleted", Property.of(p -> p.boolean_(b -> b)))
                )
        );
        log.info("Elasticsearch index '{}' created (fresh).", indexName);
    }

    private void ensureIndexExists() throws IOException {
        boolean exists = elasticsearchClient.indices().exists(e -> e.index(indexName)).value();
        if (exists) {
            return;
        }

        log.info("Elasticsearch index '{}' not found. Creating...", indexName);
        elasticsearchClient.indices().create(c -> c
                .index(indexName)
                .mappings(m -> m
                        .properties("id", Property.of(p -> p.keyword(k -> k)))
                        .properties("title", Property.of(p -> p.text(t -> t.fields("keyword", k -> k.keyword(kk -> kk.ignoreAbove(256))))))
                        .properties("shortDescription", Property.of(p -> p.text(t -> t)))
                        .properties("longDescription", Property.of(p -> p.text(t -> t)))
                        .properties("thumbnailUrl", Property.of(p -> p.keyword(k -> k)))
                        .properties("introductoryVideo", Property.of(p -> p.keyword(k -> k)))
                        .properties("language", Property.of(p -> p.keyword(k -> k)))
                        .properties("originalPrice", Property.of(p -> p.double_(d -> d)))
                        .properties("finalPrice", Property.of(p -> p.double_(d -> d)))
                        .properties("rating", Property.of(p -> p.double_(d -> d)))
                        .properties("instructorId", Property.of(p -> p.keyword(k -> k)))
                        .properties("category", Property.of(p -> p.text(t -> t.fields("keyword", k -> k.keyword(kk -> kk.ignoreAbove(256))))))
                        .properties("createdAt", Property.of(p -> p.date(d -> d)))
                        .properties("status", Property.of(p -> p.keyword(k -> k)))
                        .properties("deleted", Property.of(p -> p.boolean_(b -> b)))
                )
        );
        log.info("Elasticsearch index '{}' created.", indexName);
    }

    private void deleteUserPersonalizationSignalsIndex() throws IOException {
        boolean exists = elasticsearchClient.indices().exists(e -> e.index(userPersonalizationSignalsIndexName)).value();
        if (!exists) {
            log.info("Elasticsearch index '{}' not found. Skip deleting.", userPersonalizationSignalsIndexName);
            return;
        }

        log.info("Deleting Elasticsearch index '{}' on startup...", userPersonalizationSignalsIndexName);
        elasticsearchClient.indices().delete(d -> d.index(userPersonalizationSignalsIndexName));
        log.info("Elasticsearch index '{}' deleted.", userPersonalizationSignalsIndexName);
    }

    private BulkResponse bulkUpsertCourses(List<CourseEntity> courses) throws IOException {
        List<BulkOperation> operations = new ArrayList<>(courses.size());

        for (CourseEntity course : courses) {
            CourseEsDocument doc = CourseEsDocument.builder()
                    .id(course.getId())
                    .title(course.getTitle())
                    .shortDescription(course.getShortDescription())
                    .longDescription(course.getLongDescription())
                    .thumbnailUrl(course.getThumbnailUrl())
                    .introductoryVideo(course.getIntroductoryVideo())
                    .language(course.getLanguage())
                    .originalPrice(course.getOriginalPrice())
                    .finalPrice(course.getFinalPrice())
                    .rating(course.getRating())
                    .instructorId(course.getInstructorId())
                    .category(course.getCategory() != null ? course.getCategory().getName() : null)
                    .createdAt(course.getCreatedAt())
                    .status(course.getStatus() != null ? course.getStatus().name() : null)
                    .deleted(course.getDeleted())
                    .build();

            operations.add(BulkOperation.of(o -> o
                    .index(i -> i
                            .index(indexName)
                            .id(course.getId())
                            .document(doc)
                    )
            ));
        }

        BulkRequest request = new BulkRequest.Builder()
                .operations(operations)
                .build();

        try {
            return elasticsearchClient.bulk(request);
        } catch (ElasticsearchException ex) {
            throw new IOException("Elasticsearch bulk indexing failed: " + ex.getMessage(), ex);
        }
    }
}
