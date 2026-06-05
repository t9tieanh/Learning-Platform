package com.freeclassroom.courseservice.service.search;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.ElasticsearchException;
import co.elastic.clients.elasticsearch._types.mapping.Property;
import co.elastic.clients.elasticsearch.core.BulkRequest;
import co.elastic.clients.elasticsearch.core.BulkResponse;
import co.elastic.clients.elasticsearch.core.bulk.BulkOperation;
import com.freeclassroom.courseservice.dto.event.CourseApprovalEvent;
import com.freeclassroom.courseservice.dto.search.CourseEsDocument;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import com.freeclassroom.courseservice.enums.dto.CourseApprovalAction;
import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.exception.ErrorCode;
import com.freeclassroom.courseservice.mapper.CourseEsDocumentMapper;
import com.freeclassroom.courseservice.repository.entity.CourseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseSearchIndexService {

    private final ElasticsearchClient elasticsearchClient;
    private final CourseRepository courseRepository;
    private final CourseEsDocumentMapper courseEsDocumentMapper;

    @Value("${app.elasticsearch.course-index:courses}")
    private String indexName;

    public void handleApprovalEvent(CourseApprovalEvent event) throws IOException {
        if (event == null || event.getId() == null || event.getAction() == null) {
            throw new IllegalArgumentException("Invalid course approval event");
        }

        ensureIndexExists();

        if (event.getAction() == CourseApprovalAction.APPROVED) {
            indexPublishedCourse(event.getId());
            return;
        }

        if (event.getAction() == CourseApprovalAction.REJECTED) {
            deleteCourse(event.getId());
        }
    }

    public void indexPublishedCourse(String courseId) throws IOException {
        CourseEntity course = courseRepository.findByIdWithTagsAndCategory(courseId)
                .orElseThrow(() -> new CustomExeption(ErrorCode.COURSE_NOT_FOUND));

        CourseEsDocument document = courseEsDocumentMapper.toPublishedDocument(course);
        upsertDocument(document);
        log.info("Indexed published course {} into Elasticsearch index '{}'", courseId, indexName);
    }

    public void deleteCourse(String courseId) throws IOException {
        try {
            elasticsearchClient.delete(d -> d.index(indexName).id(courseId));
            log.info("Removed course {} from Elasticsearch index '{}'", courseId, indexName);
        } catch (ElasticsearchException ex) {
            if (ex.status() == 404) {
                log.debug("Course {} not found in Elasticsearch index '{}' (skip delete)", courseId, indexName);
                return;
            }
            throw ex;
        }
    }

    public BulkResponse bulkUpsertCourses(List<CourseEntity> courses) throws IOException {
        if (courses == null || courses.isEmpty()) {
            return null;
        }

        ensureIndexExists();

        List<BulkOperation> operations = new ArrayList<>(courses.size());
        for (CourseEntity course : courses) {
            CourseEsDocument doc = courseEsDocumentMapper.toDocument(course);
            if (doc == null || doc.getId() == null) {
                continue;
            }
            operations.add(BulkOperation.of(o -> o.index(i -> i
                    .index(indexName)
                    .id(doc.getId())
                    .document(doc)
            )));
        }

        if (operations.isEmpty()) {
            return null;
        }

        BulkRequest request = new BulkRequest.Builder().operations(operations).build();
        try {
            return elasticsearchClient.bulk(request);
        } catch (ElasticsearchException ex) {
            throw new IOException("Elasticsearch bulk indexing failed: " + ex.getMessage(), ex);
        }
    }

    public void ensureIndexExists() throws IOException {
        boolean exists = elasticsearchClient.indices().exists(e -> e.index(indexName)).value();
        if (exists) {
            return;
        }

        log.info("Elasticsearch index '{}' not found. Creating...", indexName);
        elasticsearchClient.indices().create(c -> c.index(indexName).mappings(this::courseIndexMappings));
        log.info("Elasticsearch index '{}' created.", indexName);
    }

    public void recreateIndex() throws IOException {
        boolean exists = elasticsearchClient.indices().exists(e -> e.index(indexName)).value();
        if (exists) {
            log.info("Elasticsearch index '{}' found. Deleting for fresh migration...", indexName);
            elasticsearchClient.indices().delete(d -> d.index(indexName));
        }
        elasticsearchClient.indices().create(c -> c.index(indexName).mappings(this::courseIndexMappings));
        log.info("Elasticsearch index '{}' recreated.", indexName);
    }

    private void upsertDocument(CourseEsDocument document) throws IOException {
        if (document == null || document.getId() == null) {
            throw new IllegalArgumentException("Course ES document must have an id");
        }

        try {
            elasticsearchClient.index(i -> i
                    .index(indexName)
                    .id(document.getId())
                    .document(document)
            );
        } catch (Exception ex) {
            log.error(
                    "Elasticsearch index upsert failed. index={}, courseId={}, title={}",
                    indexName,
                    document.getId(),
                    document.getTitle(),
                    ex
            );
            throw ex;
        }
    }

    private co.elastic.clients.elasticsearch._types.mapping.TypeMapping.Builder courseIndexMappings(
            co.elastic.clients.elasticsearch._types.mapping.TypeMapping.Builder m
    ) {
        return m
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
                .properties("tags", Property.of(p -> p.keyword(k -> k)))
                .properties("createdAt", Property.of(p -> p.date(d -> d)))
                .properties("status", Property.of(p -> p.keyword(k -> k)))
                .properties("deleted", Property.of(p -> p.boolean_(b -> b)));
    }
}
