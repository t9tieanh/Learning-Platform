package com.freeclassroom.courseservice.controller.user;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.PagingResponse;
import com.freeclassroom.courseservice.dto.response.course.MyCourseResponse;
import com.freeclassroom.courseservice.dto.response.course.student.CourseDetailResponse;
import com.freeclassroom.courseservice.service.course.ICourseStudentService;
import com.freeclassroom.courseservice.service.course.ICourseUserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courses-student")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseStudentController {

    ICourseUserService  courseUserService;
    ICourseStudentService courseStudentService;

    @GetMapping("/self")
    public ApiResponse<PagingResponse<MyCourseResponse>> getMyCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return courseUserService.getCourseUsers(userId, page, size);
    }

    @GetMapping("/{id}")
    public ApiResponse<CourseDetailResponse> getCourseChapter(
            @PathVariable("id") String id
    ){
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return courseStudentService.getCourseChapter(id, userId);
    }
}
