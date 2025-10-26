package com.freeclassroom.courseservice.controller.user;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.chapter.ChapterUserResponse;
import com.freeclassroom.courseservice.service.chapter.IChapterUserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chapters-user")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChapterUserController {
    IChapterUserService chapterUserService;

    @GetMapping("/{id}/public")
    public ApiResponse<ChapterUserResponse> getChapterPublic(
            @PathVariable("id") String id
    ){
        return chapterUserService.getChapterPublic(id);
    }
}
