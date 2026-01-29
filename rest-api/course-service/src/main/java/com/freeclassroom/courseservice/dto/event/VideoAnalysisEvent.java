package com.freeclassroom.courseservice.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoAnalysisEvent {
    private String lessonId;
    private String videoUrl;
}
