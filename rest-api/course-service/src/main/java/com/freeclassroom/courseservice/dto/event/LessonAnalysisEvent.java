package com.freeclassroom.courseservice.dto.event;

import com.freeclassroom.courseservice.service.utils.cloudfront.SignedUrl;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.freeclassroom.courseservice.enums.event.EnumLessonAnalysisType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonAnalysisEvent {
    private String lessonId;

    @SignedUrl
    private String fileUrl;
    private EnumLessonAnalysisType fileType; // "video" or "article"
}
