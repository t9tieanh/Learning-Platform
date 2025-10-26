package com.freeclassroom.courseservice.service.chapter;

import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.chapter.ChapterUserResponse;

public interface IChapterUserService {
    // this function is get chapter data public -> who dont buy course
    ApiResponse<ChapterUserResponse> getChapterPublic(String id);
}
