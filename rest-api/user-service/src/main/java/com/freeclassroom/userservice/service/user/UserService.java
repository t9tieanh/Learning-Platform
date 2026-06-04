package com.freeclassroom.userservice.service.user;

import com.example.grpc.course.GetCourseAdminDataResponse;
import com.example.grpc.course.ActiveAdminCourseStat;
import com.example.grpc.course.AdminInstructorLeaderboardItem;
import com.example.grpc.course.GetActiveAdminCoursesResponse;
import com.example.grpc.course.GetAdminCourseModerationCountsResponse;
import com.example.grpc.course.GetAdminInstructorLeaderboardResponse;
import com.example.grpc.course.TotalBlogResponse;
import com.example.grpc.user.GetCoursesRevenueResponse;
import com.example.grpc.user.TopCourseRevenueItem;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.freeclassroom.userservice.configuration.RabbitMQConfig;
import com.freeclassroom.userservice.dto.request.auth.Identity;
import com.freeclassroom.userservice.dto.request.personal.TrackingEventRequest;
import com.freeclassroom.userservice.dto.request.user.CreationUserRequest;
import com.freeclassroom.userservice.dto.request.user.UpdateUserRequest;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.admin.AdminPendingActionsResponse;
import com.freeclassroom.userservice.dto.response.admin.DataAdminHome;
import com.freeclassroom.userservice.dto.response.admin.TopCourseAdminItem;
import com.freeclassroom.userservice.dto.response.admin.TopInstructorAdminItem;
import com.freeclassroom.userservice.dto.response.auth.CheckForgotPasswordResponse;
import com.freeclassroom.userservice.dto.response.user.GetUserResponse;
import com.freeclassroom.userservice.dto.response.user.MyProfileResponse;
import com.freeclassroom.userservice.dto.response.user.UserResponse;
import com.freeclassroom.userservice.dto.response.user.VipStatusResponse;
import com.freeclassroom.userservice.entity.certificate.Certificate;
import com.freeclassroom.userservice.entity.redis.OTPForgetPassword;
import com.freeclassroom.userservice.entity.redis.PendingUserEntity;
import com.freeclassroom.userservice.entity.user.UserEntity;
import com.freeclassroom.userservice.enums.CertificateStatus;
import com.freeclassroom.userservice.enums.entity.EnumAccountStatus;
import com.freeclassroom.userservice.exception.CustomExeption;
import com.freeclassroom.userservice.exception.ErrorCode;
import com.freeclassroom.userservice.grpc.client.BlogGrpcClient;
import com.freeclassroom.userservice.grpc.client.CourseGrpcClient;
import com.freeclassroom.userservice.grpc.client.SaleGrpcClient;
import com.freeclassroom.userservice.mapper.user.UserMapper;
import com.freeclassroom.userservice.repository.entity.CertificateRepository;
import com.freeclassroom.userservice.repository.entity.UserRepository;
import com.freeclassroom.userservice.repository.redis.OTPForgetPasswordRepository;
import com.freeclassroom.userservice.repository.redis.PendingUserRepository;
import com.freeclassroom.userservice.service.event.EventService;
import com.freeclassroom.userservice.service.file.UploadFileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Range;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.data.redis.core.RedisOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.connection.DataType;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Set;
import java.util.HashSet;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import static com.freeclassroom.userservice.enums.RedisStreamEnum.EVENT_USER;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService implements IUserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    private static final int DEFAULT_TOP_LIMIT = 5;
    private static final int MAX_TOP_LIMIT = 50;
    private static final long CACHE_TTL_MILLIS = 45_000L;
    private static final long ADMIN_HOME_CACHE_TTL_MILLIS = 30_000L;

    PendingUserRepository pendingUserRepo;
    OTPForgetPasswordRepository otpForgetPasswordRepo;
    UserMapper userMapper;
    UploadFileService uploadFileService;
    EventService eventService;

    CourseGrpcClient courseGrpcClient;
    BlogGrpcClient blogGrpcClient;
    SaleGrpcClient saleGrpcClient;

    // template rabbitmq
    RabbitTemplate rabbitTemplate;
    RabbitMQConfig rabbitMQConfig;

    RedisOperations<String, OTPForgetPassword> redisOps;

    //password encoder
    PasswordEncoder passwordEncoder;

    @NonFinal
    @Value("${app.frontend.verify-url}")
    private String verifyUrl;

    @NonFinal
    @Value("${app.frontend.verify-otp-forgot-password-url}")
    private String verifyForgotPassword;

    private final UserRepository userRepository;
    private final CertificateRepository certificateRepository;

    private final Map<Integer, CacheEntry<List<TopCourseAdminItem>>> topCourseCache = new ConcurrentHashMap<>();
    private final Map<Integer, CacheEntry<List<TopInstructorAdminItem>>> topInstructorCache = new ConcurrentHashMap<>();
    @NonFinal
    private volatile CacheEntry<DataAdminHome> adminHomeCache;

    private record CacheEntry<T>(T value, long expiresAt) {}
    private record AdminCourseHomeStats(long courseCount, long instructorCount) {}

    private static class InstructorAggregate {
        long studentCount;
        long courseCount;
        double revenue;
    }

    private int normalizeLimit(int limit) {
        if (limit <= 0) return DEFAULT_TOP_LIMIT;
        return Math.min(limit, MAX_TOP_LIMIT);
    }

    private <T> T getValidCache(Map<Integer, CacheEntry<T>> cache, int limit) {
        CacheEntry<T> entry = cache.get(limit);
        if (entry == null || entry.expiresAt() < System.currentTimeMillis()) {
            return null;
        }
        return entry.value();
    }

    private <T> void putCache(Map<Integer, CacheEntry<T>> cache, int limit, T value) {
        cache.put(limit, new CacheEntry<>(value, System.currentTimeMillis() + CACHE_TTL_MILLIS));
    }

    private DataAdminHome getValidAdminHomeCache() {
        CacheEntry<DataAdminHome> cacheEntry = adminHomeCache;
        if (cacheEntry == null || cacheEntry.expiresAt() < System.currentTimeMillis()) {
            return null;
        }
        return cacheEntry.value();
    }

    private void putAdminHomeCache(DataAdminHome data) {
        adminHomeCache = new CacheEntry<>(data, System.currentTimeMillis() + ADMIN_HOME_CACHE_TTL_MILLIS);
    }

    private AdminCourseHomeStats loadAdminCourseHomeStats() {
        try {
            GetCourseAdminDataResponse courseResponse = courseGrpcClient.getCourseAdminData();
            if (courseResponse == null) {
                return new AdminCourseHomeStats(0L, 0L);
            }
            return new AdminCourseHomeStats(courseResponse.getTotalCourse(), courseResponse.getTotalInstructor());
        } catch (Exception courseEx) {
            log.warn("Failed to load admin course stats via gRPC", courseEx);
            return new AdminCourseHomeStats(0L, 0L);
        }
    }

    private long loadAdminBlogCount() {
        try {
            TotalBlogResponse blogResponse = blogGrpcClient.getTotalBlog();
            return blogResponse == null ? 0L : blogResponse.getTotal();
        } catch (Exception blogEx) {
            log.warn("Failed to load admin blog stats via gRPC", blogEx);
            return 0L;
        }
    }

    private long loadPendingCertificateCount() {
        try {
            Long certificateCnt = certificateRepository.countByStatus(CertificateStatus.PENDING);
            return certificateCnt != null ? certificateCnt : 0L;
        } catch (Exception certificateEx) {
            log.warn("Failed to load admin certificate stats", certificateEx);
            return 0L;
        }
    }

    public ApiResponse<UserResponse> registerUser(CreationUserRequest request) {
        // check user exits
        if (userRepository.existsByEmail(request.getEmail()))
            throw new CustomExeption(ErrorCode.EMAIL_EXISTED);

        if (userRepository.existsByUsername(request.getUsername()))
            throw new CustomExeption(ErrorCode.USERNAME_EXISTED);

        PendingUserEntity redisEntity = userMapper.toEntity(request);

        // generate token for verify
        redisEntity.setToken(UUID.randomUUID().toString());
        redisEntity.setStatus(EnumAccountStatus.ACTIVE);

        // save in Redis with TTL
        redisEntity = pendingUserRepo.save(redisEntity);

        // -> send to notification service
        redisEntity.setToken("http://" + verifyUrl + redisEntity.getToken());
        rabbitTemplate.convertAndSend(rabbitMQConfig.EXCHANGE, rabbitMQConfig.VERIFY_REGISTER_ROUTING_KEY,
                redisEntity);

        UserResponse response = UserResponse.builder()
                .name(redisEntity.getName())
                .email(redisEntity.getEmail())
                .build();

        return ApiResponse.<UserResponse>builder()
                .code(200)
                .message("Vui lòng kiểm tra email để tiếp tục !")
                .result(response)
                .build();
    }


    public ApiResponse<UserResponse> verifySignUp(String token) {
        // get token in redis
        PendingUserEntity newUser = pendingUserRepo.findById(token)
                .orElseThrow(() -> new CustomExeption(ErrorCode.WRONG_VERFY_TOKEN));

        // check user exitst
        if (userRepository.existsByUsernameOrEmail(newUser.getUsername(), newUser.getEmail()))
            throw new CustomExeption(ErrorCode.USER_EXISTED);

        // endcode password
        newUser.setPassword(
                passwordEncoder.encode(newUser.getPassword())
        );

        // Convert PendingUserEntity -> UserEntity
        UserEntity newUserEntity = userRepository.save(userMapper.toEntity(newUser));

        // del in redis
        pendingUserRepo.delete(newUser);

        UserResponse response = UserResponse.builder()
                .name(newUserEntity.getName())
                .email(newUserEntity.getEmail())
                .build();

        return ApiResponse.<UserResponse>builder()
                .code(200)
                .message("Xác thực thành công, chào mứng bạn đến với Learnova!")
                .result(response)
                .build();
    }

    public ApiResponse<Void> forgotPassword(String email) {
        // check user exits
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomExeption(ErrorCode.USER_NOT_FOUND));

        OTPForgetPassword newOtpForgetPassword = OTPForgetPassword.builder()
                .email(email)
                .name(user.getName())
                .build();

        newOtpForgetPassword = otpForgetPasswordRepo.save(newOtpForgetPassword);

        // -> send to notification service
        newOtpForgetPassword.setToken("http://" + verifyForgotPassword + newOtpForgetPassword.getToken());
        rabbitTemplate.convertAndSend(rabbitMQConfig.EXCHANGE, rabbitMQConfig.FORGOT_PASSWORD_ROUTING_KEY,
                newOtpForgetPassword);


        return ApiResponse.<Void>builder()
                .code(200)
                .message("Vui lòng kiểm tra email để tiếp tục !")
                .build();
    }

    @Override
    public ApiResponse<CheckForgotPasswordResponse> checkForgotPassword(String code) {
        // get token in redis
        OTPForgetPassword forgetPassword = otpForgetPasswordRepo.findById(code)
                .orElseThrow(() -> new CustomExeption(ErrorCode.WRONG_VERFY_TOKEN));

        Long ttl = redisOps.getExpire("pending-forget-password:" + code, TimeUnit.SECONDS);

        if (ttl == null || ttl < 0) {
            throw new CustomExeption(ErrorCode.OTP_EXPIRED);
        }

        return ApiResponse.<CheckForgotPasswordResponse>builder()
                .code(forgetPassword != null ? 200 : 0)
                .result(
                        CheckForgotPasswordResponse.builder()
                                .timeToLive(ttl)
                                .build()
                )
                .message(forgetPassword != null ? "Yêu cầu hợp lệ, bạn có thể đặt lại mật khẩu."
                        : "Yêu cầu đã hết hạn, vui lòng thử lại sau.")
                .build();
    }

    @Override
    public ApiResponse<GetUserResponse> getUser(String id) {
        try {
            UserEntity user = userRepository.findById(id)
                    .orElseThrow(() -> new CustomExeption(ErrorCode.USER_NOT_FOUND));

            GetUserResponse response = userMapper.toDto(user);

            return ApiResponse.<GetUserResponse>builder()
                    .code(HttpStatus.OK.value())
                    .message("Get user successfully")
                    .result(response)
                    .build();
        } catch (Exception e) {
            return ApiResponse.<GetUserResponse>builder()
                    .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Unexpected error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public ApiResponse<MyProfileResponse> geyMyProfile(String id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new CustomExeption(ErrorCode.USER_NOT_FOUND));

        MyProfileResponse response = userMapper.toMyProfileResponse(user);

        return ApiResponse.<MyProfileResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy thông tin profile thành công !")
                .result(response)
                .build();
    }

    @Override
    public ApiResponse<GetUserResponse> updateUser(String id, UpdateUserRequest request) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new CustomExeption(ErrorCode.USER_NOT_FOUND));

        if (request.getDescription() != null && !request.getDescription().equals(user.getDescription())) {
            user.setDescription(request.getDescription());
        }
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            user.setEmail(request.getEmail());
        }
        if (request.getName() != null && !request.getName().equals(user.getName())) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null && !request.getPhone().equals(user.getPhone())) {
            user.setPhone(request.getPhone());
        }
        if (request.getPosition() != null && !request.getPosition().equals(user.getPosition())) {
            user.setPosition(request.getPosition());
        }
        if (request.getStatus() != null && !request.getStatus().equals(user.getStatus())) {
            user.setStatus(request.getStatus());
        }

        if (request.getImage() != null && !request.getImage().isEmpty()) {
            String uploadedUrl = uploadFileService.uploadFile(request.getImage());
            user.setImage(uploadedUrl);
        }

        userRepository.save(user);

        GetUserResponse response = userMapper.toDto(user);

        return ApiResponse.<GetUserResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Chỉnh sửa thông tin profile thành công !")
                .result(response)
                .build();
    }

    @Override
    public ApiResponse<DataAdminHome> getAdminData() {
        DataAdminHome cached = getValidAdminHomeCache();
        if (cached != null) {
            return ApiResponse.<DataAdminHome>builder()
                    .code(HttpStatus.OK.value())
                    .message("Lấy data thành công!")
                    .result(cached)
                    .build();
        }

        try {
            CompletableFuture<AdminCourseHomeStats> courseFuture =
                    CompletableFuture.supplyAsync(this::loadAdminCourseHomeStats);
            CompletableFuture<Long> blogFuture =
                    CompletableFuture.supplyAsync(this::loadAdminBlogCount);
            CompletableFuture<Long> certificateFuture =
                    CompletableFuture.supplyAsync(this::loadPendingCertificateCount);

            CompletableFuture.allOf(courseFuture, blogFuture, certificateFuture).join();

            AdminCourseHomeStats courseStats = courseFuture.join();
            Long blogCount = blogFuture.join();
            Long certificateCount = certificateFuture.join();

            DataAdminHome data = DataAdminHome.builder()
                    .courseCnt(courseStats.courseCount())
                    .instructorCnt(courseStats.instructorCount())
                    .blogCnt(blogCount == null ? 0L : blogCount)
                    .certificateCnt(certificateCount == null ? 0L : certificateCount)
                    .build();

            putAdminHomeCache(data);

            return ApiResponse.<DataAdminHome>builder()
                    .code(HttpStatus.OK.value())
                    .message("Lấy data thành công!")
                    .result(data)
                    .build();

        } catch (Exception e) {
            log.error("Failed to aggregate admin home data", e);
            return ApiResponse.<DataAdminHome>builder()
                    .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Lấy data thất bại: " + e.getMessage())
                    .result(DataAdminHome.builder()
                            .courseCnt(0L)
                            .instructorCnt(0L)
                            .certificateCnt(0L)
                            .blogCnt(0L)
                            .build())
                    .build();
        }
    }

    @Override
    public ApiResponse<AdminPendingActionsResponse> getAdminPendingActions() {
        long coursePendingReviewCount = 0L;
        long rejectedCourseCount = 0L;
        long certificatePendingCount = 0L;

        try {
            Long count = certificateRepository.countByStatus(CertificateStatus.PENDING);
            certificatePendingCount = count == null ? 0L : count;
        } catch (Exception certificateEx) {
            log.warn("Failed to load pending certificate count for admin pending actions", certificateEx);
        }

        try {
            GetAdminCourseModerationCountsResponse courseCounts = courseGrpcClient.getAdminCourseModerationCounts();
            if (courseCounts != null) {
                coursePendingReviewCount = courseCounts.getPendingReviewCount();
                rejectedCourseCount = courseCounts.getRejectedCount();
            }
        } catch (Exception courseEx) {
            log.warn("Failed to load course moderation counts for admin pending actions", courseEx);
        }

        AdminPendingActionsResponse result = AdminPendingActionsResponse.builder()
                .coursePendingReviewCount(coursePendingReviewCount)
                .certificatePendingCount(certificatePendingCount)
                .rejectedCourseCount(rejectedCourseCount)
                .build();

        return ApiResponse.<AdminPendingActionsResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy dữ liệu cần xử lý thành công!")
                .result(result)
                .build();
    }

    @Override
    public ApiResponse<List<TopCourseAdminItem>> getAdminTopCourses(int limit) {
        int normalizedLimit = normalizeLimit(limit);
        List<TopCourseAdminItem> cached = getValidCache(topCourseCache, normalizedLimit);
        if (cached != null) {
            return ApiResponse.<List<TopCourseAdminItem>>builder()
                    .code(HttpStatus.OK.value())
                    .message("Lấy top khóa học thành công! (cache)")
                    .result(cached)
                    .build();
        }

        try {
            GetActiveAdminCoursesResponse activeCoursesResponse = courseGrpcClient.getActiveAdminCourses();
            List<ActiveAdminCourseStat> activeCourses = activeCoursesResponse == null
                    ? List.of()
                    : activeCoursesResponse.getItemsList();

            if (activeCourses.isEmpty()) {
                List<TopCourseAdminItem> empty = List.of();
                putCache(topCourseCache, normalizedLimit, empty);
                return ApiResponse.<List<TopCourseAdminItem>>builder()
                        .code(HttpStatus.OK.value())
                        .message("Không có dữ liệu khóa học nổi bật")
                        .result(empty)
                        .build();
            }

            List<String> courseIds = activeCourses.stream()
                    .map(ActiveAdminCourseStat::getCourseId)
                    .filter(id -> id != null && !id.isBlank())
                    .toList();

            Map<String, Double> revenueMap = new HashMap<>();
            try {
                GetCoursesRevenueResponse revenueResponse = saleGrpcClient.getCoursesRevenue(courseIds);
                if (revenueResponse != null) {
                    for (TopCourseRevenueItem item : revenueResponse.getItemsList()) {
                        revenueMap.put(item.getCourseId(), item.getRevenue());
                    }
                }
            } catch (Exception saleEx) {
                log.warn("Failed to load course revenues for top courses", saleEx);
            }

            List<TopCourseAdminItem> result = activeCourses.stream()
                    .map(course -> TopCourseAdminItem.builder()
                            .courseId(course.getCourseId())
                            .title(course.getTitle())
                            .thumbnailUrl(course.getThumbnailUrl())
                            .studentCount(course.getStudentCount())
                            .rating(course.getRating())
                            .revenue(revenueMap.getOrDefault(course.getCourseId(), 0D))
                            .build())
                    .sorted(Comparator
                            .comparingLong(TopCourseAdminItem::getStudentCount).reversed()
                            .thenComparing(Comparator.comparingDouble(TopCourseAdminItem::getRevenue).reversed())
                            .thenComparing(Comparator.comparingDouble(TopCourseAdminItem::getRating).reversed()))
                    .limit(normalizedLimit)
                    .toList();

            putCache(topCourseCache, normalizedLimit, result);

            return ApiResponse.<List<TopCourseAdminItem>>builder()
                    .code(HttpStatus.OK.value())
                    .message("Lấy top khóa học thành công!")
                    .result(result)
                    .build();
        } catch (Exception e) {
            log.error("Failed to aggregate top courses", e);
            return ApiResponse.<List<TopCourseAdminItem>>builder()
                    .code(HttpStatus.OK.value())
                    .message("Không thể lấy top khóa học, trả dữ liệu rỗng")
                    .result(List.of())
                    .build();
        }
    }

    @Override
    public ApiResponse<List<TopInstructorAdminItem>> getAdminTopInstructors(int limit) {
        int normalizedLimit = normalizeLimit(limit);
        List<TopInstructorAdminItem> cached = getValidCache(topInstructorCache, normalizedLimit);
        if (cached != null) {
            return ApiResponse.<List<TopInstructorAdminItem>>builder()
                    .code(HttpStatus.OK.value())
                    .message("Lấy top giảng viên thành công! (cache)")
                    .result(cached)
                    .build();
        }

        try {
            GetAdminInstructorLeaderboardResponse leaderboardResponse =
                    courseGrpcClient.getAdminTopInstructorsLeaderboard(normalizedLimit);
            List<AdminInstructorLeaderboardItem> leaderboardItems = leaderboardResponse == null
                    ? List.of()
                    : leaderboardResponse.getItemsList();

            if (leaderboardItems.isEmpty()) {
                List<TopInstructorAdminItem> empty = List.of();
                putCache(topInstructorCache, normalizedLimit, empty);
                return ApiResponse.<List<TopInstructorAdminItem>>builder()
                        .code(HttpStatus.OK.value())
                        .message("Không có dữ liệu giảng viên nổi bật")
                        .result(empty)
                        .build();
            }

            Set<String> instructorIds = leaderboardItems.stream()
                    .map(AdminInstructorLeaderboardItem::getInstructorId)
                    .filter(id -> id != null && !id.isBlank())
                    .collect(Collectors.toSet());

            Map<String, UserEntity> instructorProfileMap = new HashMap<>();
            if (!instructorIds.isEmpty()) {
                List<UserEntity> instructors = userRepository.findAllById(instructorIds);
                for (UserEntity instructor : instructors) {
                    instructorProfileMap.put(instructor.getId(), instructor);
                }
            }

            List<TopInstructorAdminItem> mapped = new ArrayList<>(leaderboardItems.stream()
                    .filter(item -> item.getInstructorId() != null && !item.getInstructorId().isBlank())
                    .map(item -> {
                        UserEntity profile = instructorProfileMap.get(item.getInstructorId());
                        return TopInstructorAdminItem.builder()
                                .instructorId(item.getInstructorId())
                                .instructorName(profile != null ? profile.getName() : "Giảng viên")
                                .instructorAvatar(profile != null ? profile.getImage() : "")
                                .studentCount(item.getStudentCount())
                                .courseCount(item.getCourseCount())
                                .revenue(0D)
                                .build();
                    })
                    .toList());

            for (int i = 0; i < mapped.size(); i++) {
                mapped.get(i).setRank(i + 1);
            }

            List<TopInstructorAdminItem> result = List.copyOf(mapped);
            putCache(topInstructorCache, normalizedLimit, result);

            return ApiResponse.<List<TopInstructorAdminItem>>builder()
                    .code(HttpStatus.OK.value())
                    .message("Lấy top giảng viên thành công!")
                    .result(result)
                    .build();
        } catch (Exception e) {
            log.error("Failed to aggregate top instructors", e);
            return ApiResponse.<List<TopInstructorAdminItem>>builder()
                    .code(HttpStatus.OK.value())
                    .message("Không thể lấy top giảng viên, trả dữ liệu rỗng")
                    .result(List.of())
                    .build();
        }
    }

    @Override
    public ApiResponse<Void> trackingEvent(Identity identity, TrackingEventRequest trackingEvent) {
        if (identity == null) {
            return ApiResponse.<Void>builder()
                    .code(401)
                    .message("Missing identity")
                    .build();
        }

        RecordId recordId = eventService.saveEventToRedis(identity, trackingEvent);

        if (recordId == null) {
            return ApiResponse.<Void>builder()
                    .code(500)
                    .message("Failed to write event to redis stream")
                    .build();
        }

        return ApiResponse.<Void>builder()
                .message("Personal event tracked successfully")
                .build();
    }

    public ApiResponse<UserResponse> verifyForgotPassword(String code, String newPassword) {
        // get token in redis
        OTPForgetPassword forgetPassword = otpForgetPasswordRepo.findById(code)
                .orElseThrow(() -> new CustomExeption(ErrorCode.WRONG_VERFY_TOKEN));

        // update password
        UserEntity user = userRepository.findByEmail(forgetPassword.getEmail())
                .orElseThrow(() -> new CustomExeption(ErrorCode.USER_NOT_FOUND));

        // endcode password
        user.setPassword(
                passwordEncoder.encode(newPassword)
        );

        user = userRepository.save(user);

        return ApiResponse.<UserResponse>builder()
                .code(200)
                .message("Đã đổi mật khẩu thành công !, vui lòng đăng nhập lại để trải nghiệm dịch vụ của chúng tôi !")
                .result(
                        UserResponse.builder()
                                .email(user.getEmail())
                                .name(user.getName())
                                .build()
                )
                .build();
    }

    @Override
    public ApiResponse<VipStatusResponse> getVipStatus(String userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomExeption(ErrorCode.USER_NOT_FOUND));

        boolean isVip = Boolean.TRUE.equals(user.getIsVip());

        if (!isVip || user.getUpdateVipAt() == null || user.getDurationOfVip() == null) {
            return ApiResponse.<VipStatusResponse>builder()
                    .code(HttpStatus.OK.value())
                    .message("Người dùng không phải thành viên VIP.")
                    .result(VipStatusResponse.builder().isVip(false).build())
                    .build();
        }

        LocalDateTime activatedAt = user.getUpdateVipAt();
        LocalDateTime expiresAt = activatedAt.plusMonths(user.getDurationOfVip());
        long daysRemaining = ChronoUnit.DAYS.between(LocalDateTime.now(), expiresAt);

        // VIP expired — auto-reset flag
        if (daysRemaining <= 0) {
            user.setIsVip(false);
            userRepository.save(user);
            return ApiResponse.<VipStatusResponse>builder()
                    .code(HttpStatus.OK.value())
                    .message("Gói VIP của bạn đã hết hạn.")
                    .result(VipStatusResponse.builder()
                            .isVip(false)
                            .daysRemaining(0L)
                            .expiresAt(expiresAt)
                            .build())
                    .build();
        }

        return ApiResponse.<VipStatusResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy trạng thái VIP thành công.")
                .result(VipStatusResponse.builder()
                        .isVip(true)
                        .durationMonths(user.getDurationOfVip())
                        .activatedAt(activatedAt)
                        .expiresAt(expiresAt)
                        .daysRemaining(daysRemaining)
                        .build())
                .build();
    }
}
