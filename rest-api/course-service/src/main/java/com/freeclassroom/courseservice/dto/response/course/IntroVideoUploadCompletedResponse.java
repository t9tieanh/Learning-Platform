package com.freeclassroom.courseservice.dto.response.course;

import com.freeclassroom.courseservice.service.utils.cloudfront.SignedUrl;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class IntroVideoUploadCompletedResponse {
    @SignedUrl
    String introductoryVideo;
    String message;
}
