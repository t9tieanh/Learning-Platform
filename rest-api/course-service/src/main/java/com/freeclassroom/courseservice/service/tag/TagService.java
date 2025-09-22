package com.freeclassroom.courseservice.service.tag;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.category.TagResponse;
import com.freeclassroom.courseservice.entity.category.TagEntity;
import com.freeclassroom.courseservice.mapper.TagMapper;
import com.freeclassroom.courseservice.repository.entity.TagRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
@Slf4j
public class TagService implements ITagService {
    TagRepository tagRepo;
    TagMapper tagMapper;

    @Override
    public ApiResponse<List<TagResponse>> getAllTag() {
        List<TagEntity> result = tagRepo.findAll();
        return ApiResponse.<List<TagResponse>>builder()
                .message("Lấy category thành công")
                .code(200)
                .result(result.stream()
                        .map(tagMapper::toDto)
                        .collect(Collectors.toList()))
                .build();
    }
}
