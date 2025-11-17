package com.freeclassroom.courseservice.controller.user;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.category.CategoryResponse;
import com.freeclassroom.courseservice.service.category.ICategoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryController {
    ICategoryService categoryService;

    @GetMapping
    ApiResponse<List<CategoryResponse>> getAllCategory() {
        return categoryService.getAllCategory();
    }

    @GetMapping("/active")
    ApiResponse<List<CategoryResponse>> getValidCategory() {
        return categoryService.getValidCategory();
    }
}
