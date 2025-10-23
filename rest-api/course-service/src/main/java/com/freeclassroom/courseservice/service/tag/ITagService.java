package com.freeclassroom.courseservice.service.tag;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.category.TagResponse;
import org.springframework.stereotype.Service;

import java.util.List;

public interface ITagService {
    ApiResponse<List<TagResponse>> getAllTag();
    ApiResponse<List<TagResponse>> getTagsByCourseId(String courseId);
}
