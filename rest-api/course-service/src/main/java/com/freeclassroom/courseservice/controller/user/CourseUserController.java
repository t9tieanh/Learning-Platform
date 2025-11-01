package com.freeclassroom.courseservice.controller.user;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.PagingResponse;
import com.freeclassroom.courseservice.dto.response.course.CourseUserDetailResponse;
import com.freeclassroom.courseservice.dto.response.course.MyCourseResponse;
import com.freeclassroom.courseservice.service.course.ICourseUserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courses-user")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseUserController {
    ICourseUserService courseUserService;

    @GetMapping("/{id}")
    ApiResponse<CourseUserDetailResponse> getCouseDetail(@PathVariable("id") String id) {
        return courseUserService.getCourseDetail(id);
    }
}
