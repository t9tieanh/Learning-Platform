package com.freeclassroom.courseservice.grpc.client;

import com.example.grpc.assistant.AssistantServiceGrpc;
import com.example.grpc.assistant.BatchLessonTestEligibilityRequest;
import com.example.grpc.assistant.BatchLessonTestEligibilityResponse;
import com.example.grpc.assistant.LessonTestEligibilityItem;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@Slf4j
public class AssistantGrpcClient {

    @GrpcClient("assistant-service")
    private AssistantServiceGrpc.AssistantServiceBlockingStub assistantStub;

    public List<LessonTestEligibilityItem> batchGetLessonTestEligibility(
            String userId,
            List<String> lessonIds,
            double minPassPercent
    ) {
        if (lessonIds == null || lessonIds.isEmpty()) {
            return Collections.emptyList();
        }
        try {
            BatchLessonTestEligibilityRequest request = BatchLessonTestEligibilityRequest.newBuilder()
                    .setUserId(userId)
                    .addAllLessonIds(lessonIds)
                    .setMinPassPercent(minPassPercent)
                    .build();

            BatchLessonTestEligibilityResponse response = assistantStub.batchGetLessonTestEligibility(request);
            return response.getItemsList();
        } catch (Exception ex) {
            log.error("Failed to batchGetLessonTestEligibility for userId={}: {}", userId, ex.getMessage());
            throw ex;
        }
    }
}
