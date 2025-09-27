package com.freeclassroom.courseservice.controller;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.category.CategoryResponse;
import com.freeclassroom.courseservice.service.category.ICategoryService;
import com.freeclassroom.courseservice.service.tag.ITagService;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/categorys")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryController {
    ICategoryService categoryService;

    @GetMapping
    ApiResponse<List<CategoryResponse>> getAllCategory() {
        return categoryService.getAllCategory();
    }
}
