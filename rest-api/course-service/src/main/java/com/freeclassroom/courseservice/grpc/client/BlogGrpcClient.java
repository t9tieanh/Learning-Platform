package com.freeclassroom.courseservice.grpc.client;

import com.example.grpc.course.GetFeedbackByCourseIdRequest;
import com.example.grpc.course.GetFeedbackByCourseIdResponse;
import com.example.grpc.user.BlogServiceGrpc;
import com.freeclassroom.courseservice.dto.grpc.FeedbackDto;
import com.freeclassroom.courseservice.mapper.FeedbackMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BlogGrpcClient {
    @GrpcClient("blog-service")
    @NonFinal
    private BlogServiceGrpc.BlogServiceBlockingStub blogStub;
    FeedbackMapper feedbackMapper;

    public List<FeedbackDto> getFeedbackByCourseId(String courseId) {
        GetFeedbackByCourseIdResponse response = blogStub.getFeedbackByCourseId(
                GetFeedbackByCourseIdRequest.newBuilder()
                        .setCourseId(courseId)
                        .build()
        );

        return response == null
                ? Collections.emptyList()
                : response.getFeedbacksList().stream()
                .map(feedbackMapper::toFeedbackDto)
                .collect(Collectors.toList());
    }
}
