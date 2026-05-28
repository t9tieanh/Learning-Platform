package com.freeclassroom.courseservice.service.search;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.core.DeleteByQueryRequest;
import co.elastic.clients.elasticsearch.core.DeleteByQueryResponse;
import co.elastic.clients.elasticsearch.indices.CreateIndexRequest;
import co.elastic.clients.elasticsearch.indices.ExistsRequest;
import co.elastic.clients.util.ObjectBuilder;
import com.freeclassroom.courseservice.repository.entity.CourseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.function.Function;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CourseSearchMigrationServiceTest {

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private ElasticsearchClient elasticsearchClient;

    @Mock
    private CourseRepository courseRepository;

    private CourseSearchMigrationService service;

    @BeforeEach
    void setUp() {
        service = new CourseSearchMigrationService(elasticsearchClient, courseRepository);
        ReflectionTestUtils.setField(service, "indexName", "courses");
        ReflectionTestUtils.setField(service, "userPersonalizationSignalsIndexName", "user-personalization-signals");
        ReflectionTestUtils.setField(service, "batchSize", 500);
    }

    @Test
    void migrateAllCoursesIdAndTags_shouldCreateBothIndicesWhenMissing() throws Exception {
        ReflectionTestUtils.setField(service, "recreateIndexOnStartup", false);
        ReflectionTestUtils.setField(service, "createIndexIfMissing", true);
        when(elasticsearchClient.indices().exists(anyExistsRequestFn()).value()).thenReturn(false, false);
        when(courseRepository.findAllWithTags(any())).thenReturn(Page.empty());

        service.migrateAllCoursesIdAndTags();

        verify(elasticsearchClient.indices(), times(2)).create(anyCreateIndexRequestFn());
    }

    @Test
    void cleanUserPersonalizationSignalsIndexDataDaily_shouldDeleteByQueryWhenIndexExists() throws Exception {
        when(elasticsearchClient.indices().exists(anyExistsRequestFn()).value()).thenReturn(true);
        DeleteByQueryResponse response = org.mockito.Mockito.mock(DeleteByQueryResponse.class);
        when(response.deleted()).thenReturn(10L);
        when(elasticsearchClient.deleteByQuery(anyDeleteByQueryRequestFn())).thenReturn(response);

        service.cleanUserPersonalizationSignalsIndexDataDaily();

        verify(elasticsearchClient, times(1)).deleteByQuery(anyDeleteByQueryRequestFn());
    }

    @Test
    void cleanUserPersonalizationSignalsIndexDataDaily_shouldSkipWhenIndexMissing() throws Exception {
        when(elasticsearchClient.indices().exists(anyExistsRequestFn()).value()).thenReturn(false);

        service.cleanUserPersonalizationSignalsIndexDataDaily();

        verify(elasticsearchClient, never()).deleteByQuery(anyDeleteByQueryRequestFn());
    }

    @SuppressWarnings("unchecked")
    private Function<ExistsRequest.Builder, ObjectBuilder<ExistsRequest>> anyExistsRequestFn() {
        return any(Function.class);
    }

    @SuppressWarnings("unchecked")
    private Function<CreateIndexRequest.Builder, ObjectBuilder<CreateIndexRequest>> anyCreateIndexRequestFn() {
        return any(Function.class);
    }

    @SuppressWarnings("unchecked")
    private Function<DeleteByQueryRequest.Builder, ObjectBuilder<DeleteByQueryRequest>> anyDeleteByQueryRequestFn() {
        return any(Function.class);
    }
}
