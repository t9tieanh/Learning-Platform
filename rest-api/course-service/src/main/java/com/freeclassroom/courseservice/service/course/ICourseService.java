package com.freeclassroom.courseservice.service.course;

import com.freeclassroom.courseservice.dto.request.course.CreationCourseRequest;
import com.freeclassroom.courseservice.dto.request.course.UpdateTagsRequest;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.CreationResponse;

public interface ICourseService {
    ApiResponse<CreationResponse> createCourse(CreationCourseRequest request, String userId);
    ApiResponse<CreationResponse> updateTags(String courseId, UpdateTagsRequest tags, String username);
}
