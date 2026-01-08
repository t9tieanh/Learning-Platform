package com.freeclassroom.courseservice.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    INVALID_KEY(123, "Dữ liệu yêu cầu không hợp lệ", HttpStatus.OK),
    USER_EXISTED(1001, "Người dùng đã tồn tại", HttpStatus.OK),
    USER_NOT_FOUND(1002, "Không tìm thấy người dùng", HttpStatus.OK),
    USER_BLOCKED(1007, "Tài khoản đã bị khóa", HttpStatus.OK), // đổi code tránh trùng 1002
    WRONG_PASSWORD(1003, "Sai mật khẩu", HttpStatus.UNAUTHORIZED), // 401
    UNCATEGORIZED_EXEPTION(999, "Lỗi không xác định", HttpStatus.OK),
    UNAUTHORIZED(1006, "Bạn không có quyền truy cập", HttpStatus.UNAUTHORIZED), // 401
    USERNAME_INVALID(1004, "Tên đăng nhập phải có ít nhất 3 ký tự", HttpStatus.OK),
    PASSWORD_INVALID(1005, "Mật khẩu phải có ít nhất 8 ký tự", HttpStatus.OK),
    INVALID_DOB(1008, "Ngày sinh phải từ {min} trở lên", HttpStatus.OK),
    UN_AUTHENTICATED(1009, "Người dùng chưa được xác thực", HttpStatus.UNAUTHORIZED), // 401
    OTP_SEND(1010, "Không thể gửi mã OTP", HttpStatus.OK),

    // wrong token user signup
    WRONG_VERFY_TOKEN(1002, "Mã xác thực không đúng hoặc đã hết hạn", HttpStatus.OK),
    // wrong token user signup
    WRONG_USERNAME_PASSWORD(1002, "Username hoặc password không đúng", HttpStatus.OK),

    // dùng cho xác thực otp
    NOT_VERIFY_OTP(1011, "Mã OTP không hợp lệ, vui lòng thử lại", HttpStatus.OK),

    //category không tồn tại
    CATEGORY_NOT_FOUND(1012, "Danh mục (category) không tồn tại !", HttpStatus.OK),
    TAG_NOT_FOUND(1013, "Tag không tồn tại !", HttpStatus.OK),
    COURSE_NOT_FOUND(1013, "Khóa học không tồn tại !", HttpStatus.OK),
    INFO_COURSE_NOT_OKE(1013, "Thông tin giới thiệu của khóa học chưa hoàn thành, vui lòng kiểm tra lại (title, thumbnail, ...) !", HttpStatus.OK),
    COURSE_WITHOUT_VIDEO(1013, "Khóa học này chưa đăng bài giảng nào !", HttpStatus.OK),
    COURSE_IS_PUBLISH(1013, "Khóa học chưa đã xuất bản, không thể xóa !", HttpStatus.OK),
    COURSE_WITHOUT_PRICE(1013, "Bạn chưa thiết lập giá cho khóa học này !", HttpStatus.OK),
    COURSE_NOT_PUBLISHED(1013, "Khóa học này chưa được xuất bản !", HttpStatus.OK),
    CHAPTER_NOT_FOUND(1013, "Chapter không tồn tại !", HttpStatus.OK),
    LESSON_NOT_FOUND(1013, "Bài học không tồn tại !", HttpStatus.OK),
    PRICE_NOT_RIGHT(400, "Giá gốc phải lớn hơn thực tế (giá khuyến mãi) !", HttpStatus.OK),

    UPLOAD_NOT_COMPLETED(12345, "Upload file thất bại !", HttpStatus.OK),
    FILE_NOT_FOUND(400, "Không tìm thấy file trong hệ thống !", HttpStatus.OK),
    FILE_TYPE_INVALID(12346, "Loại file không hợp lệ !", HttpStatus.OK),

    // admin
    COURSE_NOT_DONE(1234561231, "Khóa học chưa được khởi tạo xong !", HttpStatus.OK);
    ;

    private final int code;
    private final HttpStatusCode statusCode;
    private final String message;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}



