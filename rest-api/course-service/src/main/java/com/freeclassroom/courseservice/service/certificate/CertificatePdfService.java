package com.freeclassroom.courseservice.service.certificate;

import com.freeclassroom.courseservice.configuration.StudyReminderProperties;
import com.freeclassroom.courseservice.dto.certificate.CertificatePdfModel;
import com.freeclassroom.courseservice.dto.snapshot.CourseSnapshot;
import com.freeclassroom.courseservice.dto.snapshot.RecipientSnapshot;
import com.freeclassroom.courseservice.entity.certificate.CourseCompletionCertificateEntity;
import com.openhtmltopdf.outputdevice.helper.BaseRendererBuilder;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CertificatePdfService {

    private static final DateTimeFormatter ISSUED_AT_FORMATTER =
            DateTimeFormatter.ofPattern("d 'tháng' M 'năm' yyyy", new Locale("vi", "VN"));

    TemplateEngine templateEngine;
    CertificateImageLoader imageLoader;
    StudyReminderProperties studyReminderProperties;

    public byte[] generatePdf(CourseCompletionCertificateEntity certificate) {
        CertificatePdfModel model = buildModel(certificate);

        Context context = new Context(Locale.forLanguageTag("vi-VN"));
        context.setVariable("cert", model);
        String html = templateEngine.process("certificate/course-completion", context);

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useDefaultPageSize(297f, 210f, BaseRendererBuilder.PageSizeUnits.MM);
            builder.withHtmlContent(html, null);
            registerFonts(builder);
            builder.toStream(outputStream);
            builder.run();
            return outputStream.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate certificate PDF for code {}", certificate.getCertificateCode(), e);
            throw new IllegalStateException("Không thể tạo file PDF chứng chỉ", e);
        }
    }

    public String buildDownloadFilename(String certificateCode) {
        String safeCode = certificateCode != null ? certificateCode.replaceAll("[^A-Za-z0-9\\-_]", "") : "certificate";
        return "Learnova-Chung-chi-" + safeCode + ".pdf";
    }

    private CertificatePdfModel buildModel(CourseCompletionCertificateEntity certificate) {
        RecipientSnapshot recipient = certificate.getRecipientSnapshot();
        CourseSnapshot course = certificate.getCourseSnapshot();

        String courseThumbnailDataUri = imageLoader.toDataUri(course.getThumbnailUrl());
        String instructorAvatarDataUri = imageLoader.toDataUri(course.getInstructorAvatarUrl());

        String verifyUrl = buildVerifyUrl(certificate.getCertificateCode());
        String logoDataUri = imageLoader.classpathToDataUri("/images/learnernova-logo.png", "image/png");

        return CertificatePdfModel.builder()
                .recipientName(recipient.getName())
                .courseTitle(course.getTitle())
                .instructorName(course.getInstructorName())
                .certificateCode(certificate.getCertificateCode())
                .issuedAtFormatted(certificate.getIssuedAt().format(ISSUED_AT_FORMATTER))
                .verifyUrl(verifyUrl)
                .logoDataUri(logoDataUri)
                .courseThumbnailDataUri(courseThumbnailDataUri)
                .instructorAvatarDataUri(instructorAvatarDataUri)
                .hasCourseThumbnail(courseThumbnailDataUri != null)
                .hasInstructorAvatar(instructorAvatarDataUri != null)
                .build();
    }

    private String buildVerifyUrl(String certificateCode) {
        String baseUrl = studyReminderProperties.getFrontendBaseUrl();
        if (baseUrl == null || baseUrl.isBlank()) {
            return "/certificate/verify/" + certificateCode;
        }
        return baseUrl.replaceAll("/+$", "") + "/certificate/verify/" + certificateCode;
    }

    private void registerFonts(PdfRendererBuilder builder) {
        builder.useFont(
                () -> getClass().getResourceAsStream("/fonts/WorkSans-Regular.ttf"),
                "Work Sans",
                400,
                BaseRendererBuilder.FontStyle.NORMAL,
                true
        );
        builder.useFont(
                () -> getClass().getResourceAsStream("/fonts/WorkSans-Bold.ttf"),
                "Work Sans",
                700,
                BaseRendererBuilder.FontStyle.NORMAL,
                true
        );
        builder.useFont(
                () -> getClass().getResourceAsStream("/fonts/Lora-Bold.ttf"),
                "Lora",
                700,
                BaseRendererBuilder.FontStyle.NORMAL,
                true
        );
    }
}
