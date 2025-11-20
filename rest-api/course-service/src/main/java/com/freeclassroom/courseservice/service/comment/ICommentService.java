package com.freeclassroom.courseservice.service.comment;

import com.freeclassroom.courseservice.dto.request.comment.CommentRequest;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.comment.CommentResponse;

import java.util.List;

public interface ICommentService {
    ApiResponse<Boolean> createComment(CommentRequest request);
    ApiResponse<Boolean> deleteComment(String id);
    ApiResponse<List<CommentResponse>> getComments(String lessonId);
    ApiResponse<Boolean> updateComment(String id, CommentRequest request);
}
