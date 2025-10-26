package com.freeclassroom.courseservice.dto.response.course;

import com.freeclassroom.courseservice.dto.response.category.CategoryResponse;
import com.freeclassroom.courseservice.dto.response.category.TagResponse;
import com.freeclassroom.courseservice.dto.response.chapter.ChapterUserDto;
import com.freeclassroom.courseservice.dto.response.user.InstructorResponse;
import com.freeclassroom.courseservice.entity.course.ChapterEntity;
import com.freeclassroom.courseservice.entity.member.EnrollmentsEntity;
import com.freeclassroom.courseservice.enums.entity.EnumCourseStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseUserDetailResponse {
    String id;
    String title;
    String shortDescription;
    String longDescription;
    String thumbnailUrl;
    Double rating;

    String introductoryVideo;
    String language;
    Double originalPrice;
    Double finalPrice;

    InstructorResponse instructor;
    List<ChapterUserDto> chapters;

    // Tag
    List<TagResponse> tags;

    // Category
    CategoryResponse category;

    Set<String> outcomes;
    Set<String> requirements;
}
