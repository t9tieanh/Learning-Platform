package com.freeclassroom.userservice.service.recommendation;

import com.freeclassroom.userservice.dto.request.auth.Identity;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.course.CourseUserResponse;
import com.freeclassroom.userservice.dto.response.course.InstructorResponse;
import com.freeclassroom.userservice.dto.response.recommendation.RecommendedCourseItem;
import com.freeclassroom.userservice.dto.response.recommendation.RecommendedCoursePageResponse;
import com.freeclassroom.userservice.grpc.client.CourseGrpcClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Adapter layer to expose recommendation results in the same response shape as course-service's
 * user-facing course list endpoints (e.g. best-seller): ApiResponse<List<CourseUserResponse>>.
 *
 * This class intentionally does NOT alter recommendation logic.
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseRecommendationFacade {

    CourseRecommendationService recommendationService;
    CourseGrpcClient courseGrpcClient;

    public ApiResponse<List<CourseUserResponse>> getRecommendedCoursesAsCourseList(Identity identity,
                                                                                   String courseId,
                                                                                   String tag,
                                                                                   Integer page,
                                                                                   Integer size) {
        ApiResponse<RecommendedCoursePageResponse> rec = recommendationService.getTopCoursesForUser(identity, courseId, tag, page, size);
        RecommendedCoursePageResponse result = rec.getResult();
        List<RecommendedCourseItem> items = result == null ? List.of() : result.getItems();

        List<String> ids = items == null ? List.of() : items.stream()
                .map(RecommendedCourseItem::getCourseId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        // Enrich by calling course-service gRPC to get real course details
        Map<String, CourseUserResponse> byId = new HashMap<>();
        for (com.example.grpc.course.CourseResponse courseObj : courseGrpcClient.getBulkCourses(ids)) {
            CourseUserResponse mapped = mapFromGrpcCourse(courseObj);
            if (mapped != null && mapped.getId() != null) {
                byId.put(mapped.getId(), mapped);
            }
        }

        List<CourseUserResponse> out = ids.stream()
                .map(id -> byId.getOrDefault(id, CourseUserResponse.builder().id(id).build()))
                .toList();

        return ApiResponse.<List<CourseUserResponse>>builder()
                .code(rec.getCode())
                .message(rec.getMessage())
                .result(out)
                .build();
    }

    /**
     * Map gRPC CourseResponse (from proto-shared) -> CourseUserResponse.
     * Uses reflection to avoid tight coupling if generated types differ.
     */
    private static CourseUserResponse mapFromGrpcCourse(com.example.grpc.course.CourseResponse courseObj) {
        if (courseObj == null) return null;

        InstructorResponse instructor = mapInstructor(courseObj.hasInstructor() ? courseObj.getInstructor() : null);

        return CourseUserResponse.builder()
                .id(blankToNull(courseObj.getId()))
                .title(blankToNull(courseObj.getTitle()))
                .shortDescription(blankToNull(courseObj.getShortDescription()))
                .longDescription(blankToNull(courseObj.getLongDescription()))
                .thumbnailUrl(blankToNull(courseObj.getThumbnailUrl()))
                .introductoryVideo(blankToNull(courseObj.getIntroductoryVideo()))
                .language(blankToNull(courseObj.getLanguage()))
                .originalPrice(courseObj.getOriginalPrice())
                .finalPrice(courseObj.getFinalPrice())
                .rating(courseObj.getRating())
                .instructor(instructor)
                .build();
    }

    private static InstructorResponse mapInstructor(com.example.grpc.user.Teacher teacher) {
        if (teacher == null) return null;

        return InstructorResponse.builder()
                .id(blankToNull(teacher.getId()))
                .name(blankToNull(teacher.getName()))
                .email(blankToNull(teacher.getEmail()))
                .image(blankToNull(teacher.getImage()))
                .build();
    }

    private static String blankToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
