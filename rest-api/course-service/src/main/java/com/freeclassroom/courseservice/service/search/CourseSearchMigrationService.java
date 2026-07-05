package com.freeclassroom.courseservice.service.search;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.ElasticsearchException;
import co.elastic.clients.elasticsearch._types.mapping.Property;
import co.elastic.clients.elasticsearch.core.BulkRequest;
import co.elastic.clients.elasticsearch.core.BulkResponse;
import co.elastic.clients.elasticsearch.core.DeleteByQueryResponse;
import co.elastic.clients.elasticsearch.core.bulk.BulkOperation;
import com.freeclassroom.courseservice.dto.search.CourseEsDocument;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import com.freeclassroom.courseservice.mapper.CourseEsDocumentMapper;
import com.freeclassroom.courseservice.repository.entity.CourseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
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
  private final CourseEsDocumentMapper courseEsDocumentMapper;

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
      } else if (createIndexIfMissing) {
          ensureIndexExists();
          ensureUserPersonalizationSignalsIndexExists();
      }

      int pageNumber = 0;
      long totalIndexed = 0;

      while (true) {
          Pageable pageable = PageRequest.of(pageNumber, batchSize);
          Page<CourseEntity> page = courseRepository.findAllPublishedWithTags(pageable);
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
                      .properties("tags", Property.of(p -> p.keyword(k -> k)))
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
                      .properties("tags", Property.of(p -> p.keyword(k -> k)))
                      .properties("createdAt", Property.of(p -> p.date(d -> d)))
                      .properties("status", Property.of(p -> p.keyword(k -> k)))
                      .properties("deleted", Property.of(p -> p.boolean_(b -> b)))
              )
      );
      log.info("Elasticsearch index '{}' created.", indexName);
  }

  private void ensureUserPersonalizationSignalsIndexExists() throws IOException {
      boolean exists = elasticsearchClient.indices().exists(e -> e.index(userPersonalizationSignalsIndexName)).value();
      if (exists) {
          return;
      }

      log.info("Elasticsearch index '{}' not found. Creating empty index...", userPersonalizationSignalsIndexName);
      elasticsearchClient.indices().create(c -> c.index(userPersonalizationSignalsIndexName));
      log.info("Elasticsearch index '{}' created (empty).", userPersonalizationSignalsIndexName);
  }

  @Scheduled(cron = "${app.migration.elasticsearch.user-signals-cleanup-cron:0 0 0 * * *}", zone = "${app.migration.elasticsearch.user-signals-cleanup-zone:Asia/Bangkok}")
  public void cleanUserPersonalizationSignalsIndexDataDaily() {
      try {
          boolean exists = elasticsearchClient.indices().exists(e -> e.index(userPersonalizationSignalsIndexName)).value();
          if (!exists) {
              log.info("Elasticsearch index '{}' not found. Skip cleaning.", userPersonalizationSignalsIndexName);
              return;
          }

          DeleteByQueryResponse response = elasticsearchClient.deleteByQuery(d -> d
                  .index(userPersonalizationSignalsIndexName)
                  .query(q -> q.matchAll(m -> m))
          );
          log.info("Cleaned data in Elasticsearch index '{}'. Deleted documents: {}",
                  userPersonalizationSignalsIndexName, response.deleted());
      } catch (Exception ex) {
          log.error("Failed to clean data in Elasticsearch index '{}'", userPersonalizationSignalsIndexName, ex);
      }
  }

  private BulkResponse bulkUpsertCourses(List<CourseEntity> courses) throws IOException {
      List<BulkOperation> operations = new ArrayList<>(courses.size());

      for (CourseEntity course : courses) {
          CourseEsDocument doc = courseEsDocumentMapper.toPublishedDocument(course);
          if (doc == null || doc.getId() == null) {
              continue;
          }

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
