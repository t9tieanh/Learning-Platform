package com.freeclassroom.userservice.controller;

import com.freeclassroom.userservice.dto.request.auth.Identity;
import com.freeclassroom.userservice.dto.request.personal.TrackingEventRequest;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/personal")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PersonalController {

}
