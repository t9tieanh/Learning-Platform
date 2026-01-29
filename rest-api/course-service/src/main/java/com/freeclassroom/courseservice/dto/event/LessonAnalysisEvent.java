package com.freeclassroom.courseservice.dto.event;

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
    private String fileUrl;
    private EnumLessonAnalysisType fileType; // "video" or "article"
}
