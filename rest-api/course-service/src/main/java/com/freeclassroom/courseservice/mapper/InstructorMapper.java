package com.freeclassroom.courseservice.mapper;

import com.example.grpc.user.TeacherDetail;
import com.freeclassroom.courseservice.dto.response.course.InstructorCourseResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring",
        uses = {ExpertiseMapper.class, CertificateMapper.class})
public interface InstructorMapper {
    @Mapping(source = "expertisesList", target = "expertise")
    @Mapping(source = "certificatesList", target = "certificates")
    InstructorCourseResponse toResponse(TeacherDetail teacherDetail);
}
