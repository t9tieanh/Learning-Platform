package com.freeclassroom.courseservice.service.category;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.category.CategoryResponse;

import java.util.List;

public interface ICategoryService {
    ApiResponse<List<CategoryResponse>> getAllCategory();
}
