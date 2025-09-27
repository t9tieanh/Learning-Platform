package com.freeclassroom.courseservice.service.course;

import com.freeclassroom.courseservice.dto.request.course.CreationCourseRequest;
import com.freeclassroom.courseservice.dto.request.course.UpdateTagsRequest;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.CreationResponse;
import com.freeclassroom.courseservice.entity.category.CategoryEntity;
import com.freeclassroom.courseservice.entity.category.TagEntity;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import com.freeclassroom.courseservice.enums.entity.EnumCourseProgressStep;
import com.freeclassroom.courseservice.enums.entity.EnumCourseStatus;
import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.exception.ErrorCode;
import com.freeclassroom.courseservice.mapper.CourseMapper;
import com.freeclassroom.courseservice.repository.entity.CategoryRepository;
import com.freeclassroom.courseservice.repository.entity.CourseRepository;
import com.freeclassroom.courseservice.repository.entity.TagRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
@Slf4j
public class CourseService implements ICourseService {
    CourseRepository courseRepo;
    CategoryRepository categoryRepo;
    TagRepository tagRepo;

    CourseMapper courseMapper;

    @Override
    public ApiResponse<CreationResponse> createCourse(CreationCourseRequest request, String userId) {
        CourseEntity newCourse = null;

        if (request.getId() == null || request.getId().isEmpty()) {
            newCourse = courseMapper.toEntity(request);
            newCourse.setInstructorId(userId);

            //set progress step and status of course
            newCourse.setProgressStep(EnumCourseProgressStep.INTRO);
            newCourse.setStatus(EnumCourseStatus.DRAFT);
        } else {
            // get from database
            newCourse = courseRepo.findById(request.getId()).orElseThrow(() -> new CustomExeption(ErrorCode.UNAUTHORIZED));
            // check permission
            if (!newCourse.getInstructorId().equals(userId))
                throw new CustomExeption(ErrorCode.UNAUTHORIZED);

            // update data
            courseMapper.toEntity(request, newCourse);
        }

        // check category
        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()){
            CategoryEntity category = categoryRepo.findById(request.getCategoryIds()).orElseThrow(
                    () -> new CustomExeption(ErrorCode.CATEGORY_NOT_FOUND)
            );
            newCourse.setCategory(category);
        }

        //save entity
        newCourse = courseRepo.save(newCourse);

        return ApiResponse.<CreationResponse>builder()
                .message("Tạo khóa học thành công !")
                .code(200)
                .result(CreationResponse.builder()
                        .id(newCourse.getId())
                        .name(newCourse.getTitle())
                        .build())
                .build();
    }

    @Override
    public ApiResponse<CreationResponse> updateTags(String courseId, UpdateTagsRequest tags, String username){
        // check course and permission
        CourseEntity course = courseRepo.findByIdAndInstructorId(courseId, username)
                .orElseThrow(() -> new CustomExeption(ErrorCode.UNAUTHORIZED));

        List<TagEntity> updatedTags = tagRepo.findAllById(tags.getTagIds());
        if (updatedTags.size() != tags.getTagIds().size()) {
            throw new CustomExeption(ErrorCode.TAG_NOT_FOUND);
        }

        // save tags
        course.setTags(updatedTags);

        // save course
        course = courseRepo.save(course);

        return ApiResponse.<CreationResponse>builder()
                .message("Thêm Tag cho khóa học thành công !")
                .code(200)
                .result(CreationResponse.builder()
                        .name(course.getTitle())
                        .id(course.getId())
                        .build())
                .build();
    }

}
