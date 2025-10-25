package com.freeclassroom.courseservice.service.course;

import com.freeclassroom.courseservice.dto.request.common.FileUploadRequest;
import com.freeclassroom.courseservice.dto.request.course.CreationCourseRequest;
import com.freeclassroom.courseservice.dto.request.course.GetCourseRequest;
import com.freeclassroom.courseservice.dto.request.course.UpdatePriceRequest;
import com.freeclassroom.courseservice.dto.request.course.UpdateTagsRequest;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.CreationResponse;
import com.freeclassroom.courseservice.dto.response.common.FileUploadResponse;
import com.freeclassroom.courseservice.dto.response.course.*;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;

import java.io.IOException;
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
    ApiResponse<List<CourseResponse>> getBestSellerCourse(int limit);
    ApiResponse<List<CourseResponse>> getTrendyCourse(int limit);
    ApiResponse<PageResponse<CourseResponse>> getAllCourses(int page, int limit, String search, String category,
                                                            Double minPrice, Double minRating);
    Flux<ServerSentEvent<String>> updateVideoIntroduce(MultipartFile avatar, String courseId) throws IOException;
    ApiResponse<CreationResponse> updatePrice(UpdatePriceRequest newPrice, String courseId);
    ApiResponse<PriceCourseResponse> getPrice(String courseId);
    ApiResponse<CourseOverviewResponse> getOverview(String courseId);
    ApiResponse<CreationResponse> requestApproval(String id);
}
