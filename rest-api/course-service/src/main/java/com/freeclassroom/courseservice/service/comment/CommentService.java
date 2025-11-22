package com.freeclassroom.courseservice.service.comment;

import com.example.grpc.user.GetUserResponse;
import com.freeclassroom.courseservice.dto.request.comment.CommentRequest;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.comment.CommentResponse;
import com.freeclassroom.courseservice.entity.comment.CommentEntity;
import com.freeclassroom.courseservice.grpc.client.UserGrpcClient;
import com.freeclassroom.courseservice.mapper.CommentMapper;
import com.freeclassroom.courseservice.repository.entity.CommentRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CommentService implements ICommentService{
    CommentRepository commentRepository;
    CommentMapper commentMapper;
    UserGrpcClient userGrpcClient;
    @Override
    public ApiResponse<Boolean> createComment(CommentRequest request) {
        try {
            CommentEntity comment = new CommentEntity();
            comment.setLessonId(request.getLessonId());
            comment.setUserId(request.getUserId());
            comment.setParentId(request.getParentId());
            comment.setContent(request.getContent());

            commentRepository.save(comment);
            return ApiResponse.<Boolean>builder()
                    .code(HttpStatus.OK.value())
                    .message("Create message success")
                    .result(true)
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.<Boolean>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Create message failed")
                    .result(false)
                    .build();
        }
    }

    @Override
    @Transactional
    public ApiResponse<Boolean> deleteComment(String id) {
        try {
            if (!commentRepository.existsById(id)) {
                return ApiResponse.<Boolean>builder()
                        .code(HttpStatus.NOT_FOUND.value())
                        .message("Comment not found")
                        .result(false)
                        .build();
            }

            // Xóa cả cây comment
            deleteCommentTree(id);

            return ApiResponse.<Boolean>builder()
                    .code(HttpStatus.OK.value())
                    .message("Delete comment success")
                    .result(true)
                    .build();

        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.<Boolean>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Delete comment failed")
                    .result(false)
                    .build();
        }
    }

    @Override
    public ApiResponse<List<CommentResponse>> getComments(String lessonId) {
        try {
            List<CommentEntity> comments = commentRepository.findByLessonIdOrderByCreatedAtAsc(lessonId);

            List<CommentResponse> responses = comments.stream()
                    .map(commentMapper::toDto)
                    .toList();

            List<CommentResponse> tree = buildCommentTree(responses);

            return ApiResponse.<List<CommentResponse>>builder()
                    .code(HttpStatus.OK.value())
                    .message("Load comments success")
                    .result(tree)
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.<List<CommentResponse>>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Load comments failed")
                    .result(null)
                    .build();
        }
    }

    @Override
    public ApiResponse<Boolean> updateComment(String id, CommentRequest request) {
        try {
            Optional<CommentEntity> optional = commentRepository.findById(id);
            if (optional.isEmpty()) {
                return ApiResponse.<Boolean>builder()
                        .code(HttpStatus.NOT_FOUND.value())
                        .message("Comment not found")
                        .result(false)
                        .build();
            }

            CommentEntity comment = optional.get();

            comment.setContent(request.getContent());

            commentRepository.save(comment);

            return ApiResponse.<Boolean>builder()
                    .code(HttpStatus.OK.value())
                    .message("Update comment success")
                    .result(true)
                    .build();

        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.<Boolean>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Update comment failed")
                    .result(false)
                    .build();
        }
    }

    private List<CommentResponse> buildCommentTree(List<CommentResponse> comments) {
        Map<String,CommentResponse> map = new HashMap<>();
        List<CommentResponse> roots = new ArrayList<>();

        for(CommentResponse c : comments) {
            GetUserResponse user = userGrpcClient.getUser(c.getUserId());
            c.setUserName(user.getName());
            c.setUserAvt(user.getImage());
            map.put(c.getId(), c);
            if (c.getChildren() == null) {
                c.setChildren(new ArrayList<>());
            }
        }

        for (CommentResponse c : comments) {
            if (c.getParentId() == null) {
                roots.add(c);
                continue;
            }

            CommentResponse parent = map.get(c.getParentId());
            if (parent != null) {
                parent.getChildren().add(c);
            }
        }

        roots.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));

        for (CommentResponse r : roots) {
            if (r.getChildren() != null) {
                r.getChildren().sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
            }
        }

        return roots;
    }

    private void deleteCommentTree(String id) {
        // Lấy tất cả comment con
        List<CommentEntity> children = commentRepository.findByParentId(id);

        // Xóa toàn bộ con trước
        for (CommentEntity child : children) {
            deleteCommentTree(child.getId());
        }

        // Sau đó xoá chính nó
        commentRepository.deleteById(id);
    }

}
