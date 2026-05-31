package com.freeclassroom.courseservice.service.certificate;

import com.example.grpc.user.GetUserResponse;
import com.freeclassroom.courseservice.configuration.RabbitMQConfig;
import com.freeclassroom.courseservice.configuration.StudyReminderProperties;
import com.freeclassroom.courseservice.dto.event.CertificateIssuedEvent;
import com.freeclassroom.courseservice.dto.snapshot.CourseSnapshot;
import com.freeclassroom.courseservice.dto.snapshot.RecipientSnapshot;
import com.freeclassroom.courseservice.entity.certificate.CourseCompletionCertificateEntity;
import com.freeclassroom.courseservice.entity.member.EnrollmentsEntity;
import com.freeclassroom.courseservice.grpc.client.UserGrpcClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CertificateIssuedNotificationService {

    RabbitTemplate rabbitTemplate;
    UserGrpcClient userGrpcClient;
    StudyReminderProperties studyReminderProperties;

    public void publish(CourseCompletionCertificateEntity certificate, EnrollmentsEntity enrollment) {
        try {
            CertificateIssuedEvent event = buildEvent(certificate, enrollment);
            if (!StringUtils.hasText(event.getEmail())) {
                log.warn(
                        "[CertificateIssued] Skip email — missing address for user {} cert {}",
                        enrollment.getUserId(),
                        certificate.getCertificateCode()
                );
                return;
            }

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.USER_NOTIFICATION_EXCHANGE,
                    RabbitMQConfig.CERTIFICATE_ISSUED_ROUTING_KEY,
                    event
            );
            log.info(
                    "[CertificateIssued] Queued notification email for user {} cert {}",
                    enrollment.getUserId(),
                    certificate.getCertificateCode()
            );
        } catch (Exception ex) {
            log.error(
                    "[CertificateIssued] Failed to queue notification for cert {}: {}",
                    certificate.getCertificateCode(),
                    ex.getMessage(),
                    ex
            );
        }
    }

    private CertificateIssuedEvent buildEvent(
            CourseCompletionCertificateEntity certificate,
            EnrollmentsEntity enrollment
    ) {
        RecipientSnapshot recipient = certificate.getRecipientSnapshot();
        CourseSnapshot course = certificate.getCourseSnapshot();

        String userName = recipient != null && StringUtils.hasText(recipient.getName())
                ? recipient.getName()
                : "bạn";
        String email = resolveEmail(enrollment.getUserId());

        String baseUrl = studyReminderProperties.getFrontendBaseUrl().replaceAll("/+$", "");
        String courseId = course != null ? course.getCourseId() : null;

        return CertificateIssuedEvent.builder()
                .userId(enrollment.getUserId())
                .userName(userName)
                .email(email)
                .courseId(courseId)
                .courseTitle(course != null ? course.getTitle() : null)
                .courseThumbnailUrl(course != null ? course.getThumbnailUrl() : null)
                .certificateId(certificate.getId())
                .certificateCode(certificate.getCertificateCode())
                .profileUrl(baseUrl + "/me?mode=cert")
                .courseUrl(courseId != null ? baseUrl + "/course/" + courseId : baseUrl)
                .build();
    }

    private String resolveEmail(String userId) {
        try {
            GetUserResponse user = userGrpcClient.getUser(userId);
            return user != null ? user.getEmail() : null;
        } catch (Exception ex) {
            log.warn("[CertificateIssued] Failed to resolve email for user {}: {}", userId, ex.getMessage());
            return null;
        }
    }
}
