package com.freeclassroom.courseservice.service.search;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Operator;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch._types.query_dsl.TextQueryType;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.Hit;
import co.elastic.clients.json.JsonData;
import com.freeclassroom.courseservice.dto.search.CourseEsDocument;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseSearchService {

    private final ElasticsearchClient elasticsearchClient;

    @Value("${app.elasticsearch.course-index:courses-dev}")
    private String courseIndex;

    public EsPage<CourseEsDocument> searchCourses(
            int page,
            int limit,
            String search,
            String category,
            Double minPrice,
            Double minRating,
            String sort
    ) throws IOException {
        int safePage = Math.max(page, 1);
        int safeLimit = Math.max(limit, 1);
        int from = (safePage - 1) * safeLimit;

        Query query = buildQuery(search, category, minPrice, minRating);

        SearchResponse<CourseEsDocument> response = elasticsearchClient.search(s -> {
                    var req = s.index(courseIndex)
                            .from(from)
                            .size(safeLimit)
                            .trackTotalHits(t -> t.enabled(true))
                            .query(query);

                    // Sorting
                    return applySort(req, sort, search);
                },
                CourseEsDocument.class
        );

        List<CourseEsDocument> items = response.hits().hits().stream()
                .map(Hit::source)
                .filter(java.util.Objects::nonNull)
                .toList();

        long total = Optional.ofNullable(response.hits().total())
                .map(t -> t.value())
                .orElse((long) items.size());

        int totalPages = (int) Math.ceil((double) total / safeLimit);

        return new EsPage<>(items, safePage, safeLimit, total, totalPages);
    }

    private Query buildQuery(String search, String category, Double minPrice, Double minRating) {
        BoolQuery.Builder bool = new BoolQuery.Builder();

        // only published courses - best effort (if field exists in mapping)
        bool.filter(f -> f.term(t -> t.field("status").value("PUBLISHED")));

        // not deleted - best effort
        bool.filter(f -> f.term(t -> t.field("deleted").value(false)));

        if (hasText(search)) {
            String normalizedSearch = search.trim();

            bool.should(s -> s.term(t -> t
                    .field("title.keyword")
                    .value(normalizedSearch)
                    .boost(30.0f)
            ));
            bool.should(s -> s.matchPhrase(mp -> mp
                    .field("title")
                    .query(normalizedSearch)
                    .boost(18.0f)
            ));
            bool.should(s -> s.match(m -> m
                    .field("title")
                    .query(normalizedSearch)
                    .operator(Operator.And)
                    .boost(12.0f)
            ));
            bool.should(s -> s.multiMatch(mm -> mm
                    .query(normalizedSearch)
                    .fields("title^8", "shortDescription^2", "longDescription")
                    .type(TextQueryType.BestFields)
                    .boost(6.0f)
            ));
            bool.should(s -> s.multiMatch(mm -> mm
                    .query(normalizedSearch)
                    .fields("title^5", "shortDescription^1.5", "longDescription")
                    .type(TextQueryType.BoolPrefix)
                    .boost(3.0f)
            ));
            bool.minimumShouldMatch("1");
        }

        if (category != null && !category.isBlank()) {
            bool.filter(f -> f.term(t -> t.field("category.keyword").value(category)));
        }

        if (minPrice != null) {
            bool.filter(f -> f.range(r -> r.field("finalPrice").gte(JsonData.of(minPrice))));
        }

        if (minRating != null) {
            bool.filter(f -> f.range(r -> r.field("rating").gte(JsonData.of(minRating))));
        }

        return new Query.Builder().bool(bool.build()).build();
    }

    private co.elastic.clients.elasticsearch.core.SearchRequest.Builder applySort(
            co.elastic.clients.elasticsearch.core.SearchRequest.Builder builder,
            String sort,
            String search
    ) {
        String normalizedSort = sort == null ? "" : sort.trim();

        return switch (normalizedSort) {
            case "price-low" -> builder.sort(s -> s.field(f -> f.field("finalPrice").order(SortOrder.Asc)));
            case "price-high" -> builder.sort(s -> s.field(f -> f.field("finalPrice").order(SortOrder.Desc)));
            default -> hasText(search)
                    ? builder
                    .sort(s -> s.score(sc -> sc.order(SortOrder.Desc)))
                    .sort(s -> s.field(f -> f.field("createdAt").order(SortOrder.Desc)))
                    : builder.sort(s -> s.field(f -> f.field("createdAt").order(SortOrder.Desc)));
        };
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    public record EsPage<T>(List<T> items, int page, int size, long totalItems, int totalPages) {}
}
