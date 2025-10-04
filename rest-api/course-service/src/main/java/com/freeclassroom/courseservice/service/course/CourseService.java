package com.freeclassroom.courseservice.service.course;

import com.freeclassroom.courseservice.dto.request.common.FileUploadRequest;
import com.freeclassroom.courseservice.dto.request.course.CreationCourseRequest;
import com.freeclassroom.courseservice.dto.request.course.UpdateTagsRequest;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.CreationResponse;
import com.freeclassroom.courseservice.dto.response.common.FileUploadResponse;
import com.freeclassroom.courseservice.dto.response.course.CourseInfoResponse;
import com.freeclassroom.courseservice.dto.response.course.CourseResponse;
import com.freeclassroom.courseservice.dto.response.course.PageResponse;
import com.freeclassroom.courseservice.entity.category.CategoryEntity;
import com.freeclassroom.courseservice.entity.category.TagEntity;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import com.freeclassroom.courseservice.enums.entity.EnumCourseProgressStep;
import com.freeclassroom.courseservice.enums.entity.EnumCourseStatus;
import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.exception.ErrorCode;
import com.freeclassroom.courseservice.grpc.client.UserGrpcClient;
import com.freeclassroom.courseservice.mapper.CourseMapper;
import com.freeclassroom.courseservice.repository.entity.CategoryRepository;
import com.freeclassroom.courseservice.repository.entity.CourseRepository;
import com.freeclassroom.courseservice.repository.entity.TagRepository;
import com.freeclassroom.courseservice.service.utils.file.IUploadFileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
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

    IUploadFileService fileService;

    UserGrpcClient userGrpcClient;
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

    @Override
    public ApiResponse<FileUploadResponse> updateAvatar(FileUploadRequest request, String courseId) {
        // check course
        CourseEntity course = courseRepo.findById(courseId)
                .orElseThrow(() -> new CustomExeption(ErrorCode.COURSE_NOT_FOUND));

        //update image
        course.setThumbnailUrl(fileService.uploadFile(request.getFile()));

        //save to db
        course = courseRepo.save(course);

        return ApiResponse.<FileUploadResponse>builder()
                .code(200)
                .message("Bạn đã cập nhật thumbnail khóa học thành công !")
                .result(FileUploadResponse.builder()
                        .imageUrl(course.getThumbnailUrl())
                        .build())
                .build();

    }

    @Override
    public ApiResponse<PageResponse<CourseResponse>> getCoursesByTeacherId(String instructorId, int page, int size) {
        try {
            Pageable pageable = PageRequest.of(Math.max(0, page - 1), size, Sort.by("createdAt").descending());
            Page<CourseEntity> coursePage = courseRepo.findByInstructorId(instructorId, pageable);
            List<CourseResponse> items = courseMapper.toDtoList(coursePage.getContent());
            PageResponse<CourseResponse> pageResponse = PageResponse.<CourseResponse>builder()
                    .items(items)
                    .page(coursePage.getNumber() + 1)
                    .size(coursePage.getSize())
                    .totalElements(coursePage.getTotalElements())
                    .totalPages(coursePage.getTotalPages())
                    .build();

            return ApiResponse.<PageResponse<CourseResponse>>builder()
                    .code(HttpStatus.OK.value())
                    .message("Lấy danh sách khóa học thành công")
                    .result(pageResponse)
                    .build();

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Lỗi khi lấy danh sách course theo instructorId = " + instructorId);

            return ApiResponse.<PageResponse<CourseResponse>>builder()
                    .code(999)
                    .message("Lỗi server: " + e.getMessage())
                    .result(null)
                    .build();
        }
    }

    @Override
    public ApiResponse<CourseInfoResponse> getCourseInfo(String id) {
        // check course
        CourseEntity course = courseRepo.findById(id)
                .orElseThrow(() -> new CustomExeption(ErrorCode.COURSE_NOT_FOUND));

        CourseInfoResponse result = courseMapper.toInfoResponseDto(course);
        result.setCategory(course.getCategory().getName());

        return ApiResponse.<CourseInfoResponse>builder()
                .code(200)
                .message("Lấy thông tin khóa học thành công !")
                .result(result)
                .build();
    }

    @Override
    public boolean isTeacherOfCourse(String courseId, String userId) {
        return courseRepo.existsByIdAndInstructorId(courseId, userId);
    }
}
