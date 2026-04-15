package com.freeclassroom.courseservice.dto.request.lesson;

import com.freeclassroom.courseservice.enums.entity.EnumLessonType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChunkCompleteRequest {
    @NotEmpty
    @Size(max = 10000)
    List<@Valid ChunkUploadPartRequest> parts;

    @NotNull
    EnumLessonType fileType;

    String title;
    String content;
    Long duration;
    Long position;
    Boolean isPublic;
}
