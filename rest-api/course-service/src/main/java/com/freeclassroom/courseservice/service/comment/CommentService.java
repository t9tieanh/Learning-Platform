package com.freeclassroom.courseservice.service.comment;

import com.example.grpc.user.GetUserResponse;
import com.freeclassroom.courseservice.dto.request.comment.CommentRequest;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.comment.CommentResponse;
import com.freeclassroom.courseservice.entity.comment.CommentEntity;
import com.freeclassroom.courseservice.grpc.client.UserGrpcClient;
import com.freeclassroom.courseservice.mapper.CommentMapper;
import com.freeclassroom.courseservice.repository.entity.CommentRepository;
import com.freeclassroom.courseservice.repository.entity.LessonRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CommentService implements ICommentService{
    static final String ANONYMOUS_USER = "anonymousUser";
    static final String UNKNOWN_AUTHOR_NAME = "Người dùng";
    static final String UNKNOWN_AUTHOR_AVATAR = "";

    CommentRepository commentRepository;
    LessonRepository lessonRepository;
    CommentMapper commentMapper;
    UserGrpcClient userGrpcClient;
    @Override
    public ApiResponse<CommentResponse> createComment(CommentRequest request, String userId) {
        try {
            if (!StringUtils.hasText(userId) || ANONYMOUS_USER.equals(userId)) {
                return ApiResponse.<CommentResponse>builder()
                        .code(HttpStatus.UNAUTHORIZED.value())
                        .message("Authentication required")
                        .result(null)
                        .build();
            }

            CommentEntity comment = new CommentEntity();
            comment.setLessonId(request.getLessonId());
            comment.setUserId(userId);
            comment.setParentId(request.getParentId());
            comment.setContent(request.getContent());

            CommentEntity savedComment = commentRepository.save(comment);
            CommentResponse response = enrichComment(commentMapper.toDto(savedComment));

            return ApiResponse.<CommentResponse>builder()
                    .code(HttpStatus.OK.value())
                    .message("Create message success")
                    .result(response)
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.<CommentResponse>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Create message failed")
                    .result(null)
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
            enrichComment(c);
            map.put(c.getId(), c);
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

        roots.sort((a, b) -> compareCreatedAtDesc(a.getCreatedAt(), b.getCreatedAt()));

        for (CommentResponse r : roots) {
            if (r.getChildren() != null) {
                r.getChildren().sort((a, b) -> compareCreatedAtDesc(a.getCreatedAt(), b.getCreatedAt()));
            }
        }

        return roots;
    }

    private CommentResponse enrichComment(CommentResponse comment) {
        if (!StringUtils.hasText(comment.getUserId())) {
            comment.setUserName(UNKNOWN_AUTHOR_NAME);
            comment.setUserAvt(UNKNOWN_AUTHOR_AVATAR);
            comment.setIsInstructor(false);
            ensureChildren(comment);
            return comment;
        }

        try {
            GetUserResponse user = userGrpcClient.getUser(comment.getUserId());
            comment.setUserName(StringUtils.hasText(user.getName()) ? user.getName() : UNKNOWN_AUTHOR_NAME);
            comment.setUserAvt(user.getImage());
        } catch (RuntimeException e) {
            comment.setUserName(UNKNOWN_AUTHOR_NAME);
            comment.setUserAvt(UNKNOWN_AUTHOR_AVATAR);
        }
        comment.setIsInstructor(isLessonInstructor(comment.getLessonId(), comment.getUserId()));
        ensureChildren(comment);
        return comment;
    }

    private void ensureChildren(CommentResponse comment) {
        if (comment.getChildren() == null) {
            comment.setChildren(new ArrayList<>());
        }
    }

    private int compareCreatedAtDesc(Date left, Date right) {
        if (left == null && right == null) {
            return 0;
        }
        if (left == null) {
            return 1;
        }
        if (right == null) {
            return -1;
        }
        return right.compareTo(left);
    }

    private boolean isLessonInstructor(String lessonId, String userId) {
        if (!StringUtils.hasText(lessonId) || !StringUtils.hasText(userId)) {
            return false;
        }
        return lessonRepository.findInstructorIdByLessonId(lessonId)
                .map(userId::equals)
                .orElse(false);
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
