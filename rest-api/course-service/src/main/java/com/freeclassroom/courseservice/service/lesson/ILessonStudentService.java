package com.freeclassroom.courseservice.service.lesson;

import com.freeclassroom.courseservice.dto.request.lesson.MakeNoteForLessonRequest;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.CreationResponse;
import com.freeclassroom.courseservice.dto.response.course.LessonInfoResponse;
import com.freeclassroom.courseservice.dto.response.course.student.LessonOverviewResponse;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;

public interface ILessonStudentService {
    boolean canViewLessonByAccessToken(String lessonId, String userId);
    boolean canViewLesson(String lessonId, String userId);
    ResponseEntity<Resource> getLesson(String lessonId, String rangeHeader) throws Exception;
    ApiResponse<LessonInfoResponse> getLessonInfo(String id, String userId);
    ApiResponse<CreationResponse> markDone(String lessonId, String userId);
    ApiResponse<CreationResponse> makeNote(String lessonId, String userId, MakeNoteForLessonRequest request);
}
