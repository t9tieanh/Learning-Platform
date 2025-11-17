package com.freeclassroom.courseservice.sagas;

import com.freeclassroom.courseservice.configuration.RabbitMQConfig;
import com.freeclassroom.courseservice.dto.sagas.MessageDTO;
import com.freeclassroom.courseservice.dto.sagas.RegisterRequestDto;
import com.freeclassroom.courseservice.dto.sagas.RegisterResponseDto;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import com.freeclassroom.courseservice.entity.member.EnrollmentsEntity;
import com.freeclassroom.courseservice.enums.sagas.EnumMessageType;
import com.freeclassroom.courseservice.repository.entity.CourseRepository;
import com.freeclassroom.courseservice.repository.entity.EnrollmentRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConsumerRegistrationService {

    CourseRepository courseRepository;
    EnrollmentRepository enrollmentRepository;
    RabbitTemplate rabbitTemplate;

    @RabbitListener(queues = RabbitMQConfig.REGISTER_SERVICE_QUEUE, containerFactory = "rabbitListenerContainerFactory")
    public void receiveMessage(MessageDTO<RegisterRequestDto> message) {
        try {
            if (message.getType() == EnumMessageType.ORDER_CREATED) {
                handleRegisterUserToCourse(message);
            } else {
                rollbackRegisterCourse(message);
            }
        } catch (Exception e) {
            System.err.println("Error processing message: " + e.getMessage());
            sendFailureMessage(message);
        }
    }

    @Transactional
    protected void handleRegisterUserToCourse(MessageDTO<RegisterRequestDto> message) {
        List<String> courseIds = message.getPayload().getItems()
                .stream().map(RegisterRequestDto.Item::getCourse_id).toList();

        List<CourseEntity> courses = courseRepository.findAllByIdWithEnrollments(courseIds);

        courses.forEach(course -> {
            EnrollmentsEntity enrollment = EnrollmentsEntity.builder()
                    .progress(0d)
                    .userId(message.getPayload().getUserId())
                    .course(course)
                    .build();
            course.getEnrollments().add(enrollment);
        });

        courseRepository.saveAll(courses);

        // send success message
        sendSuccessMessage(message);
    }

    // handle saga message for rollback transaction
    private void rollbackRegisterCourse(MessageDTO<RegisterRequestDto> message) {
        List<String> courseIds = message.getPayload().getItems()
                .stream().map(RegisterRequestDto.Item::getCourse_id).toList();

        enrollmentRepository.deleteAllByUserIdAndCourseIds(message.getPayload().getUserId(), courseIds);

        sendFailureMessage(message);
    }

    // send message to sale service to notify success
    private void sendSuccessMessage(MessageDTO<RegisterRequestDto> message) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.SAGA_EXCHANGE,
                RabbitMQConfig.ORDER_SERVICE_QUEUE_ROUTING_KEY,
                MessageDTO.<RegisterResponseDto>builder()
                        .correlationId(message.getCorrelationId())
                        .type(EnumMessageType.REGISTER_UPDATED)
                        .version("1")
                        .source("course-service")
                        .payload(RegisterResponseDto.builder()
                                .orderId(message.getPayload().getOrderId())
                                .build())
                        .build()
        );
    }

    // send message to sale service to notify fail
    private void sendFailureMessage(MessageDTO<RegisterRequestDto> message) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.SAGA_EXCHANGE,
                RabbitMQConfig.ORDER_SERVICE_QUEUE_ROUTING_KEY,
                MessageDTO.<RegisterResponseDto>builder()
                        .correlationId(message.getCorrelationId())
                        .type(EnumMessageType.REGISTER_UPDATE_FAILED)
                        .version("1")
                        .source("course-service")
                        .payload(RegisterResponseDto.builder()
                                .orderId(message.getPayload().getOrderId())
                                .build())
                        .build()
        );
    }
}

