package com.freeclassroom.courseservice.dto.request.lesson;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChunkedUploadInitRequest {
    @NotBlank
    String chapterId;

    @NotBlank
    String title;

    @Size(max = 2000)
    String content;

    @NotBlank
    String fileName;

    @NotBlank
    String contentType;

    @NotNull
    @Min(1)
    Long fileSize;

    @Min(0)
    Long duration;

    @Min(0)
    Long position;

    Boolean isPublic;

    @Min(0)
    Long chunkSize;
}

