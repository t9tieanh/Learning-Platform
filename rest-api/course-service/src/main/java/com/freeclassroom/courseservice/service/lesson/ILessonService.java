package com.freeclassroom.courseservice.service.lesson;

import com.freeclassroom.courseservice.dto.request.lesson.CreationVideoRequest;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.CreationResponse;

public interface ILessonService {
    ApiResponse<CreationResponse> addVideo(CreationVideoRequest lesson);
}
