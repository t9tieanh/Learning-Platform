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
import com.freeclassroom.courseservice.entity.category.CategoryEntity;
import com.freeclassroom.courseservice.entity.category.TagEntity;
import com.freeclassroom.courseservice.entity.course.ChapterEntity;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import com.freeclassroom.courseservice.entity.course.LessonEntity;
import com.freeclassroom.courseservice.enums.entity.EnumCourseProgressStep;
import com.freeclassroom.courseservice.enums.entity.EnumCourseStatus;
import com.freeclassroom.courseservice.enums.entity.EnumLessonType;
import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.exception.ErrorCode;
import com.freeclassroom.courseservice.grpc.client.UserGrpcClient;
import com.freeclassroom.courseservice.mapper.CourseMapper;
import com.freeclassroom.courseservice.mapper.LessonMapper;
import com.freeclassroom.courseservice.repository.entity.CategoryRepository;
import com.freeclassroom.courseservice.repository.entity.ChapterRepository;
import com.freeclassroom.courseservice.repository.entity.CourseRepository;
import com.freeclassroom.courseservice.repository.entity.TagRepository;
import com.freeclassroom.courseservice.service.utils.file.IUploadFileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
@Slf4j
public class CourseService implements ICourseService {
    CourseRepository courseRepo;
    CategoryRepository categoryRepo;
    TagRepository tagRepo;
    ChapterRepository chapterRepo;

    CourseMapper courseMapper;
    LessonMapper lessonMapper;

    IUploadFileService fileService;

    @NonFinal
    private Double PLATFORM_FEES = 0.1d;

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
    public ApiResponse<CourseResponse> getCourse(String id) {
        try {
            CourseEntity entity = courseRepo.findByIdWithTags(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));

            System.out.println("cate" + entity.getCategory().getName());

            courseRepo.findByIdWithChapters(id)
                    .ifPresent(e -> entity.setChapters(e.getChapters()));

            courseRepo.findByIdWithEnrollments(id)
                    .ifPresent(e -> entity.setEnrollments(e.getEnrollments()));

            CourseResponse response = courseMapper.toDto(entity);

            response.getChapters().forEach(chapterDTO -> {
                var chapter = chapterRepo.findByIdWithLessons(chapterDTO.getId())
                        .orElseThrow(() -> new RuntimeException("Chapter not found"));
                chapterDTO.setLessons(
                        chapter.getLessons()
                                .stream()
                                .map(lessonMapper::toResponse)
                                .collect(Collectors.toList())
                );
            });

            return ApiResponse.<CourseResponse>builder()
                    .code(HttpStatus.OK.value())
                    .message("Lấy khóa học thành công")
                    .result(response)
                    .build();
        } catch (Exception e) {
            return ApiResponse.<CourseResponse>builder()
                    .code(HttpStatus.NOT_FOUND.value())
                    .message("Lỗi: " + e.getMessage())
                    .result(null)
                    .build();
        }
    }

    @Override
    public Flux<ServerSentEvent<String>> updateVideoIntroduce(MultipartFile avatar, String courseId) throws IOException {
        CourseEntity course = courseRepo.findById(courseId)
                .orElseThrow(() -> new CustomExeption(ErrorCode.COURSE_NOT_FOUND));

        return fileService.uploadFileWithProgress(avatar)
                .flatMap(event -> {
                    // ongoing upload
                    if (event.getFileUrl() == null) {
                        return Mono.just(ServerSentEvent.<String>builder()
                                .event("uploading")
                                .data("{\"progress\": " + event.getProgress() + "}")
                                .build());
                    }

                    // when finish upload
                    String fileUrl = event.getFileUrl();

                    // send event "saving_db"
                    ServerSentEvent<String> savingEvent = ServerSentEvent.<String>builder()
                            .event("saving_db")
                            .data("{\"message\": \"Upload file thành công, đang lưu những dữ liệu còn lại !...\"}")
                            .build();

                    // save to db
                    course.setIntroductoryVideo(fileUrl);
                    courseRepo.save(course);

                    ServerSentEvent<String> completedEvent = ServerSentEvent.<String>builder()
                            .event("completed")
                            .data("{\"lessonId\": \"" + course.getId() + "\", \"message\": \"Video giới thiệu đã được tải lên thành công !\"}")
                            .build();

                    return Flux.just(savingEvent, completedEvent);
                });
    }

    @Override
    public ApiResponse<CreationResponse> updatePrice(UpdatePriceRequest newPrice, String courseId) {
        if (newPrice.getOriginalPrice() < newPrice.getFinalPrice())
            throw new CustomExeption(ErrorCode.PRICE_NOT_RIGHT);

        CourseEntity course = courseRepo.findById(courseId)
                .orElseThrow(() -> new CustomExeption(ErrorCode.COURSE_NOT_FOUND));

        //set price for course
        course.setOriginalPrice(newPrice.getOriginalPrice());
        course.setFinalPrice(newPrice.getFinalPrice());
        course.setProgressStep(EnumCourseProgressStep.PRICING);

        //save entity
        courseRepo.save(course);

        return ApiResponse.<CreationResponse>builder()
                .code(200)
                .message("Chỉnh sửa giá cho khóa học thành công !")
                .result(
                        CreationResponse.builder()
                                .id(course.getId())
                                .build()
                )
                .build();
    }

    @Override
    public ApiResponse<PriceCourseResponse> getPrice(String courseId) {
        CourseEntity course = courseRepo.findById(courseId)
                .orElseThrow(() -> new CustomExeption(ErrorCode.COURSE_NOT_FOUND));

        Double originalPrice = 0d;
        Double finalPrice = 0d;

        if (course.getFinalPrice() != null && course.getOriginalPrice() != null) {
            originalPrice = course.getOriginalPrice();
            finalPrice = course.getFinalPrice();
        }


        return ApiResponse.<PriceCourseResponse>builder()
                .code(200)
                .message("Lấy thông tin giá khóa học thành công !")
                .result(
                        PriceCourseResponse.builder()
                                .id(course.getId())
                                .originalPrice(originalPrice)
                                .finalPrice(finalPrice)
                                .platformFee(PLATFORM_FEES)
                                // ammount instructor receive
                                .yourIncome(finalPrice * (1 - PLATFORM_FEES))
                                .build()
                )
                .build();
    }

    @Override
    public ApiResponse<CourseOverviewResponse> getOverview(String courseId) {
        CourseEntity course = courseRepo.findById(courseId)
                .orElseThrow(() -> new CustomExeption(ErrorCode.COURSE_NOT_FOUND));

        return ApiResponse.<CourseOverviewResponse>builder()
                .code(200)
                .message("Lấy thông tin tổng quan của khóa học thành công !")
                .result(
                        CourseOverviewResponse.builder()
                                .videoDuration(courseRepo.getTotalVideoDurationByCourseId(courseId))
                                .lessonNum(courseRepo.countLessonsByCourseId(courseId))
                                .finalPrice(course.getFinalPrice())
                                .courseId(course.getId())
                                .build()
                )
                .build();
    }

    @Override
    public ApiResponse<CreationResponse> requestApproval(String id) {
        CourseEntity course = courseRepo.findById(id)
                .orElseThrow(() -> new CustomExeption(ErrorCode.COURSE_NOT_FOUND));

        if (courseRepo.countLessonsByCourseId(id) == 0)
            throw new CustomExeption(ErrorCode.COURSE_WITHOUT_VIDEO);

        if (!course.getProgressStep().equals(EnumCourseProgressStep.PRICING)
                || course.getFinalPrice() == 0 || course.getOriginalPrice() == 0 )
            throw new CustomExeption(ErrorCode.COURSE_WITHOUT_PRICE);

        // -> maybe approval
        course.setProgressStep(EnumCourseProgressStep.SETTINGS);
        course.setStatus(EnumCourseStatus.PENDING_REVIEW);
        courseRepo.save(course);

        return ApiResponse.<CreationResponse>builder()
                .code(200)
                .message("Gửi yêu cầu duyệt thành công !, chúng tôi sẽ liên hệ với bạn trong khoảng thời gian sớm nhất !")
                .result(
                        CreationResponse.builder()
                                .id(course.getId())
                                .name(course.getTitle())
                                .build()
                )
                .build();
    }
}
