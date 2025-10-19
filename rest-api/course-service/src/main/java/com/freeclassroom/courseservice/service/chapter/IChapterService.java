package com.freeclassroom.courseservice.service.chapter;

import com.freeclassroom.courseservice.dto.request.chapter.CreationChapterRequest;
import com.freeclassroom.courseservice.dto.request.chapter.UpdateChapterRequest;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.chapter.ChapterDto;
import com.freeclassroom.courseservice.dto.response.common.CreationResponse;
import com.freeclassroom.courseservice.dto.response.course.ChapterResponse;

import java.util.List;

public interface IChapterService {
    ApiResponse<List<ChapterDto>> getChaptersByCourseId(String courseId);
    ApiResponse<List<ChapterDto>> getAllChapters();
    ApiResponse<ChapterResponse> findById(String chapterId);
    ApiResponse<CreationResponse> addChapter(CreationChapterRequest newChapter);
    ApiResponse<ChapterResponse> updateChapter(String chapterId , UpdateChapterRequest updateChapter);
    boolean canEditChapter(String chapterId, String instructorId);
    ApiResponse<CreationResponse> deleteChapterById(String chapterId);
}
