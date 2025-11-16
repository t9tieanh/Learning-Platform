package com.freeclassroom.courseservice.service.lesson;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.CreationResponse;
import com.freeclassroom.courseservice.dto.response.course.student.LessonOverviewResponse;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;

public interface ILessonStudentService {
    boolean canViewLessonByAccessToken(String lessonId, String userId);
    boolean canViewLesson(String lessonId, String userId);
    ResponseEntity<Resource> getLesson(String lessonId, String rangeHeader) throws Exception;
    ApiResponse<LessonOverviewResponse> getLessonInfo(String id);
    ApiResponse<CreationResponse> markDone(String lessonId, String userId);
}
