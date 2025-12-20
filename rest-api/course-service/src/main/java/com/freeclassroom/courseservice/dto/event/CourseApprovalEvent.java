package com.freeclassroom.courseservice.dto.event;

import com.freeclassroom.courseservice.dto.response.category.TagResponse;
import com.freeclassroom.courseservice.enums.dto.CourseApprovalAction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CourseApprovalEvent {
    private String id;
    private CourseApprovalAction action;
    private String reason;
    private String instructorId;
    private String title;
    private String shortDescription;
    private String longDescription;
    private String thumbnailUrl;
    private Double rating;
    private String introductoryVideo;
    private String language;
    private Double originalPrice;
    private Double finalPrice;
    private List<TagResponse> tags;
}
