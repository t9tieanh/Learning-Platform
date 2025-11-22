package com.freeclassroom.courseservice.controller.user;

import com.freeclassroom.courseservice.dto.request.comment.CommentRequest;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.comment.CommentResponse;
import com.freeclassroom.courseservice.service.comment.ICommentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lesson-comment")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CommentController {

    ICommentService commentService;

    @PostMapping
    ApiResponse<Boolean> createComment(
            @RequestBody CommentRequest request
    ) {
        return commentService.createComment(request);
    }

    @DeleteMapping("/{id}")
    ApiResponse<Boolean> deleteComment(
            @PathVariable String id
    ) {
        return commentService.deleteComment(id);
    }

    @GetMapping
    ApiResponse<List<CommentResponse>> getComments(
            @RequestParam String lessonId
    ) {
        return commentService.getComments(lessonId);
    }

    @PutMapping("/{id}")
    ApiResponse<Boolean> updateComment(
            @PathVariable String id,
            @RequestBody CommentRequest request
    ) {
        return commentService.updateComment(id, request);
    }
}
