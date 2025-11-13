package com.freeclassroom.userservice.service.certificate;

import com.freeclassroom.userservice.dto.request.certificates.CreateCertReq;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.certificate.CertificateResponse;
import com.freeclassroom.userservice.dto.response.user.UserResponse;
import com.freeclassroom.userservice.entity.certificate.Certificate;
import com.freeclassroom.userservice.entity.user.UserEntity;
import com.freeclassroom.userservice.enums.CertificateStatus;
import com.freeclassroom.userservice.mapper.certificate.CertificateMapper;
import com.freeclassroom.userservice.repository.entity.CertificateRepository;
import com.freeclassroom.userservice.repository.entity.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.text.Normalizer;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CertificateService implements ICertificateService {
    UserRepository userRepository;
    CertificateRepository certificateRepository;
    CertificateMapper certificateMapper;
    Set<String> trustedDomains = Set.of(
            "www.credly.com/badges"
    );

    HttpClient httpClient = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.NORMAL)
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    @Override
    public ApiResponse<CertificateResponse> createCertificate(CreateCertReq req, String userId) {
        try {
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new EntityNotFoundException("User with id " + userId + " not found"));

            Certificate cert = certificateMapper.toEntity(req);
            if (req.getIssueDate() != null && !req.getIssueDate().isBlank()) {
                cert.setIssueDate(LocalDate.parse(req.getIssueDate()));
            }

            VerificationResult result = verifyCredentialUrl(req.getCredentialUrl(), user.getName(), cert);

            cert.setVerified(result.verified);
            cert.setVerificationSource(result.source);
            cert.setVerifyNote(result.note);
            cert.setUserId(userId);
            cert.setStatus(CertificateStatus.PENDING);
            if (result.verified) {
                cert.setVerifiedAt(LocalDateTime.now());
            }
            System.out.println("RESULT VERIFY: " + result.verified);
            if (!result.verified) {
                return ApiResponse.<CertificateResponse>builder()
                        .code(HttpStatus.BAD_REQUEST.value())
                        .message("Xác minh chứng chỉ thất bại: " + (result.note != null ? result.note : "Không hợp lệ"))
                        .result(null)
                        .build();
            }

            certificateRepository.save(cert);

            return ApiResponse.<CertificateResponse>builder()
                    .code(HttpStatus.OK.value())
                    .message("Chứng chỉ đã được tạo, vui lòng chờ xác nhận!")
                    .result(certificateMapper.toDto(cert))
                    .build();

        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.<CertificateResponse>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Tạo chứng chỉ thất bại!")
                    .result(null)
                    .build();
        }
    }

    @Override
    public ApiResponse<List<CertificateResponse>> getCertificates(String userId) {
        try {
            List<Certificate> certificates = certificateRepository.findAllByUserId(userId);

            List<CertificateResponse> responseList = certificates.stream()
                    .map(certificateMapper::toDto)
                    .toList();

            return ApiResponse.<List<CertificateResponse>>builder()
                    .code(HttpStatus.OK.value())
                    .message("Lấy danh sách chứng chỉ thành công!")
                    .result(responseList)
                    .build();

        } catch (Exception e) {
            return ApiResponse.<List<CertificateResponse>>builder()
                    .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Đã xảy ra lỗi khi lấy danh sách chứng chỉ.")
                    .result(Collections.emptyList())
                    .build();
        }
    }

    @Override
    public ApiResponse<Boolean> deleteCertificate(String id) {
        try {
            Certificate certificateOpt = certificateRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy chứng chỉ"));

            certificateRepository.deleteById(id);

            return ApiResponse.<Boolean>builder()
                    .code(HttpStatus.OK.value())
                    .message("Xóa chứng chỉ thành công!")
                    .result(true)
                    .build();

        } catch (Exception e) {
            return ApiResponse.<Boolean>builder()
                    .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Đã xảy ra lỗi khi xóa chứng chỉ: " + e.getMessage())
                    .result(false)
                    .build();
        }
    }

    @Override
    public ApiResponse<List<CertificateResponse>> adminGetCertificates() {
        try {
            List<Certificate> certificates = certificateRepository.findAll();

            // Lấy danh sách response, kèm thông tin user
            List<CertificateResponse> responseList = certificates.stream()
                    .map(cert -> {
                        CertificateResponse dto = certificateMapper.toDto(cert);

                        // Lấy user dựa vào userId
                        cert.getUserId(); // giả sử Certificate có userId
                        Optional<UserEntity> userOpt = userRepository.findById(cert.getUserId());
                        userOpt.ifPresent(user -> {
                            dto.setUserId(user.getId());
                            dto.setUserName(user.getName());
                            dto.setUserEmail(user.getEmail());
                        });

                        return dto;
                    })
                    .toList();

            return ApiResponse.<List<CertificateResponse>>builder()
                    .code(HttpStatus.OK.value())
                    .message("Lấy danh sách chứng chỉ thành công!")
                    .result(responseList)
                    .build();

        } catch (Exception e) {
            return ApiResponse.<List<CertificateResponse>>builder()
                    .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Đã xảy ra lỗi khi lấy danh sách chứng chỉ.")
                    .result(Collections.emptyList())
                    .build();
        }
    }

    @Override
    public ApiResponse<Boolean> updateCertificate(String id, String reason, String status) {
        try {
            // Tìm certificate theo id
            Optional<Certificate> optionalCert = certificateRepository.findById(id);
            if (optionalCert.isEmpty()) {
                return ApiResponse.<Boolean>builder()
                        .code(HttpStatus.NOT_FOUND.value())
                        .message("Chứng chỉ không tồn tại!")
                        .result(false)
                        .build();
            }

            Certificate certificate = optionalCert.get();

            certificate.setStatus(CertificateStatus.valueOf(status.toUpperCase()));
            certificate.setReason(reason);

            certificateRepository.save(certificate);

            CertificateResponse response = certificateMapper.toDto(certificate);

            return ApiResponse.<Boolean>builder()
                    .code(HttpStatus.OK.value())
                    .message("Cập nhật chứng chỉ thành công!")
                    .result(true)
                    .build();

        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ApiResponse.<Boolean>builder()
                    .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Đã xảy ra lỗi khi cập nhật chứng chỉ.")
                    .result(false)
                    .build();
        }

    }

    // Verification logic
    VerificationResult verifyCredentialUrl(String url, String username, Certificate cert) {
        try {
            if (url == null || url.isBlank()) {
                return VerificationResult.pending("Bạn chưa điền URL!");
            }

            URI uri = URI.create(url);
            String host = uri.getHost();
            String path = uri.getPath();
            if (host == null || !host.equals("www.credly.com") || path == null || !path.startsWith("/badges/")) {
                return VerificationResult.pending("URL thông tin xác thực không hợp lệ!");
            }

            // HEAD check
            HttpRequest headReq = HttpRequest.newBuilder(uri)
                    .method("HEAD", HttpRequest.BodyPublishers.noBody())
                    .timeout(Duration.ofSeconds(5))
                    .build();
            HttpResponse<Void> headResp = httpClient.send(headReq, HttpResponse.BodyHandlers.discarding());
            int status = headResp.statusCode();
            if (!(status >= 200 && status < 400)) {
                return VerificationResult.pending("Trạng thái URL " + status);
            }

            // GET body
            HttpRequest getReq = HttpRequest.newBuilder(uri)
                    .GET()
                    .timeout(Duration.ofSeconds(8))
                    .build();
            HttpResponse<String> getResp = httpClient.send(getReq, HttpResponse.BodyHandlers.ofString());
            String body = getResp.body();
            if (body == null || body.isBlank()) {
                return VerificationResult.pending("Page body is empty");
            }

            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0")
                    .timeout(8000)
                    .get();

            // Lấy title, organization, image từ meta tags
//            String title = doc.selectFirst("meta[property=og:title]").attr("content");
//            String imageUrl = doc.selectFirst("meta[property=og:image]").attr("content");
//
//            String organization = null;
//            if (title != null && title.contains("was issued by")) {
//                organization = title.split("was issued by")[1].trim();
//            }

            String titleRaw = doc.selectFirst("meta[property=og:title]").attr("content");
            String imageUrl = doc.selectFirst("meta[property=og:image]").attr("content");

            String title = titleRaw;
            String organization = null;

            if (titleRaw != null && titleRaw.contains("was issued by")) {
                title = titleRaw.split("was issued by")[0].trim();

                String orgPart = titleRaw.split("was issued by")[1];
                if (orgPart.contains("to")) {
                    organization = orgPart.split("to")[0].trim();
                } else {
                    organization = orgPart.trim();
                }
            }

            cert.setTitle(title);
            cert.setOrganization(organization);
            cert.setImageUrl(imageUrl);

            if (username == null || username.isBlank()) {
                return VerificationResult.pending("No username provided for verification");
            }

            String normBody = normalizeText(body);
            String normUsername = normalizeText(username);

            // Full name match
            String fullNameRegex = "\\b" + Pattern.quote(normUsername) + "\\b";
            Pattern fullPattern = Pattern.compile(fullNameRegex, Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
            Matcher fullMatcher = fullPattern.matcher(normBody);
            if (fullMatcher.find()) {
                return VerificationResult.verified("Full username matched", "SYSTEM");
            }

            // Token-based match
            int minTokenLen = 3;
            int minMatchesRequired = 2;
            List<String> tokens = Arrays.stream(normUsername.split("\\s+"))
                    .map(String::trim)
                    .filter(s -> s.length() >= minTokenLen)
                    .collect(Collectors.toList());

            int matchCount = 0;
            for (String token : tokens) {
                String tokenRegex = "\\b" + Pattern.quote(token) + "\\b";
                Pattern tokenPattern = Pattern.compile(tokenRegex, Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
                if (tokenPattern.matcher(normBody).find()) {
                    matchCount++;
                }
                if (matchCount >= minMatchesRequired) break;
            }

            if (matchCount >= minMatchesRequired) {
                return VerificationResult.verified("Username tokens matched (" + matchCount + ")", "SYSTEM");
            } else {
                return VerificationResult.pending("Tên người dùng không được tìm thấy đầy đủ trong trang thông tin xác thực");
            }

        } catch (Exception e) {
            return VerificationResult.pending("Verification error: " + e.getMessage());
        }
    }
    private String normalizeText(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFKD)
                .replaceAll("\\p{M}", ""); // remove diacritical marks
        // collapse whitespace and lower-case
        return normalized.replaceAll("\\s+", " ").trim().toLowerCase();
    }
    private record VerificationResult(boolean verified, String note, String source) {
        static VerificationResult verified(String note, String source) {
            return new VerificationResult(true, note, source);
        }

        static VerificationResult pending(String note) {
            return new VerificationResult(false, note, "SYSTEM");
        }
    }
}

