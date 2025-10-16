package com.freeclassroom.courseservice.service.course;

import com.freeclassroom.courseservice.dto.request.common.FileUploadRequest;
import com.freeclassroom.courseservice.dto.request.course.CreationCourseRequest;
import com.freeclassroom.courseservice.dto.request.course.GetCourseRequest;
import com.freeclassroom.courseservice.dto.request.course.UpdateTagsRequest;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.CreationResponse;
import com.freeclassroom.courseservice.dto.response.common.FileUploadResponse;
import com.freeclassroom.courseservice.dto.response.course.CourseInfoResponse;
import com.freeclassroom.courseservice.dto.response.course.CourseResponse;
import com.freeclassroom.courseservice.dto.response.course.PageResponse;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.List;

public interface ICourseService {
    ApiResponse<CreationResponse> createCourse(CreationCourseRequest request, String userId);
    ApiResponse<CreationResponse> updateTags(String courseId, UpdateTagsRequest tags, String username);
    ApiResponse<PageResponse<CourseResponse>> getCoursesByTeacherId(String instructorId, int page, int size);
    boolean isTeacherOfCourse(String courseId, String userId);
    ApiResponse<FileUploadResponse> updateAvatar(FileUploadRequest request, String courseId);
    ApiResponse<CourseInfoResponse> getCourseInfo(String id);
    @EntityGraph(attributePaths = {"outcomes", "requirements"})
    ApiResponse<CourseResponse> getCourse(String id);
}
