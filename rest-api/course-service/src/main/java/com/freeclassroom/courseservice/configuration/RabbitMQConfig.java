package com.freeclassroom.courseservice.configuration;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    // --- config saga pattern
    public static final String SAGA_EXCHANGE = "app_events";

    public static final String REGISTER_SERVICE_QUEUE = "register.service.queue";
    public static final String REGISTER_SERVICE_QUEUE_ROUTING_KEY = "order.#";

    //routingkey for order.serivce.queue
    public static final String ORDER_SERVICE_QUEUE_ROUTING_KEY = "register.updated.v1";

    // --- config course approval/reject ---
    public static final String COURSE_APPROVAL_QUEUE = "course.approval.queue";
    public static final String COURSE_APPROVAL_EXCHANGE = "course.approval.exchange";
    public static final String COURSE_APPROVAL_ROUTING_KEY = "course.approval.#";

    @Bean
    public Queue registerCourseQueue () {
        return new Queue(REGISTER_SERVICE_QUEUE, true);
    }

    @Bean
    public TopicExchange sagaExchange() {
        return new TopicExchange(SAGA_EXCHANGE, true, false);
    }

    @Bean
    Binding bindingSagaTransactionMessage(Queue registerCourseQueue, TopicExchange sagaExchange) {
        return BindingBuilder
                .bind(registerCourseQueue)
                .to(sagaExchange)
                .with(REGISTER_SERVICE_QUEUE_ROUTING_KEY);
    }

    // --- course approval queue/exchange/binding ---
    @Bean
    public Queue courseApprovalQueue() {
        return new Queue(COURSE_APPROVAL_QUEUE, true);
    }

    @Bean
    public TopicExchange courseApprovalExchange() {
        return new TopicExchange(COURSE_APPROVAL_EXCHANGE, true, false);
    }

    @Bean
    public Binding bindingCourseApproval(Queue courseApprovalQueue, TopicExchange courseApprovalExchange) {
        return BindingBuilder
                .bind(courseApprovalQueue)
                .to(courseApprovalExchange)
                .with(COURSE_APPROVAL_ROUTING_KEY);
    }

    // --- config lesson analysis ---
    public static final String LESSON_ANALYSIS_QUEUE = "lesson.analysis.queue";
    public static final String LESSON_ANALYSIS_EXCHANGE = "lesson.analysis.exchange";
    public static final String LESSON_ANALYSIS_ROUTING_KEY = "lesson.analysis.#";

    @Bean
    public Queue lessonAnalysisQueue() {
        return new Queue(LESSON_ANALYSIS_QUEUE, true);
    }

    @Bean
    public TopicExchange lessonAnalysisExchange() {
        return new TopicExchange(LESSON_ANALYSIS_EXCHANGE, true, false);
    }

    @Bean
    public Binding bindingLessonAnalysis(Queue lessonAnalysisQueue, TopicExchange lessonAnalysisExchange) {
        return BindingBuilder
                .bind(lessonAnalysisQueue)
                .to(lessonAnalysisExchange)
                .with(LESSON_ANALYSIS_ROUTING_KEY);
    }
    // --- config rabbit mq ----

    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter messageConverter) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(messageConverter);
        return rabbitTemplate;
    }

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            Jackson2JsonMessageConverter messageConverter) {

        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(messageConverter);
        factory.setAcknowledgeMode(AcknowledgeMode.AUTO);
        factory.setDefaultRequeueRejected(true);
        return factory;
    }
}
