package com.freeclassroom.courseservice.controller.admin;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.admin.AdminBusinessPerformanceResponse;
import com.freeclassroom.courseservice.service.course.IAdminBusinessPerformanceService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminBusinessPerformanceController {
    IAdminBusinessPerformanceService adminBusinessPerformanceService;

    @GetMapping("/business-performance")
    public ApiResponse<AdminBusinessPerformanceResponse> getBusinessPerformance(
            @RequestParam(defaultValue = "12m") String range
    ) {
        return adminBusinessPerformanceService.getBusinessPerformance(range);
    }
}
