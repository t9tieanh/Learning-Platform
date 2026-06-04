package com.freeclassroom.courseservice.mapper;

import com.freeclassroom.courseservice.dto.search.CourseEsDocument;
import com.freeclassroom.courseservice.entity.category.TagEntity;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import com.freeclassroom.courseservice.enums.entity.EnumCourseStatus;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Component
public class CourseEsDocumentMapper {

    public CourseEsDocument toDocument(CourseEntity course) {
        if (course == null) {
            return null;
        }

        return CourseEsDocument.builder()
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
                .deleted(Boolean.TRUE.equals(course.getDeleted()))
                .tags(extractTagNames(course))
                .build();
    }

    public CourseEsDocument toPublishedDocument(CourseEntity course) {
        CourseEsDocument doc = toDocument(course);
        if (doc == null) {
            return null;
        }
        doc.setStatus(EnumCourseStatus.PUBLISHED.name());
        doc.setDeleted(false);
        return doc;
    }

    private static List<String> extractTagNames(CourseEntity course) {
        if (course.getTags() == null || course.getTags().isEmpty()) {
            return Collections.emptyList();
        }
        return course.getTags().stream()
                .map(TagEntity::getName)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(name -> !name.isEmpty())
                .distinct()
                .toList();
    }
}
