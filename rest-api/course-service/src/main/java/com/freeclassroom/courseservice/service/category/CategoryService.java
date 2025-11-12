package com.freeclassroom.courseservice.service.category;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.category.CategoryResponse;
import com.freeclassroom.courseservice.entity.category.CategoryEntity;
import com.freeclassroom.courseservice.mapper.CategoryMapper;
import com.freeclassroom.courseservice.repository.entity.CategoryRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import static redis.clients.authentication.core.TokenAuthConfig.builder;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
@Slf4j
public class CategoryService implements ICategoryService {
    CategoryRepository categoryRepo;
    CategoryMapper categoryMapper;

    // get all category
    @Override
    public ApiResponse<List<CategoryResponse>> getAllCategory() {
        List<CategoryEntity> result = categoryRepo.findAll();
        return ApiResponse.<List<CategoryResponse>>builder()
                .message("Lấy category thành công")
                .code(200)
                .result(result.stream()
                        .map(categoryMapper::toDto)
                        .collect(Collectors.toList()))
                .build();
    }

    @Override
    public ApiResponse<List<CategoryResponse>> getValidCategory() {
        List<CategoryEntity> result = categoryRepo.findAllWithPublishedAndCompletedCourses();
        return ApiResponse.<List<CategoryResponse>>builder()
                .message("Lấy category thành công")
                .code(200)
                .result(result.stream()
                        .map(categoryMapper::toDto)
                        .collect(Collectors.toList()))
                .build();
    }
}
