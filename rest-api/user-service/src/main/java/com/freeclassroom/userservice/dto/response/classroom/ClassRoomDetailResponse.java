package com.freeclassroom.userservice.dto.response.classroom;

import com.freeclassroom.userservice.dto.response.classroom.classdetail.SectionResponse;
import com.freeclassroom.userservice.dto.response.classroom.classdetail.TeacherResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ClassRoomDetailResponse {
    String name;
    String unit;
    String code;
    String detail;
    String coverImage;
    List<SectionResponse> sections;
    TeacherResponse teacher;
    List<TagReponse> tag;
}
