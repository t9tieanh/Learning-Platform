package com.freeclassroom.courseservice.mapper;
import com.example.grpc.course.Feedback;
import com.freeclassroom.courseservice.dto.grpc.FeedbackDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FeedbackMapper {
    FeedbackDto toFeedbackDto(Feedback feedbacks);
}
