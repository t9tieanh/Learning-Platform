package com.freeclassroom.courseservice.configuration;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.aopalliance.aop.Advice;
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

    // --- study reminder (daily email) ---
    public static final String USER_NOTIFICATION_EXCHANGE = "user-notification-exchange";
    public static final String STUDY_REMINDER_QUEUE = "study-reminder.queue";
    public static final String STUDY_REMINDER_ROUTING_KEY = "course.study.reminder";

    // --- course completion certificate issued ---
    public static final String CERTIFICATE_ISSUED_QUEUE = "certificate-issued.queue";
    public static final String CERTIFICATE_ISSUED_ROUTING_KEY = "course.certificate.issued";

    // --- config course approval/reject ---
    public static final String COURSE_APPROVAL_QUEUE = "course.approval.queue";
    public static final String COURSE_APPROVAL_EXCHANGE = "course.approval.exchange";
    public static final String COURSE_APPROVAL_ROUTING_KEY = "course.approval.#";
    public static final String ASSISTANT_COURSE_EMBEDDING_QUEUE = "assistant.course.embedding.queue";

    // --- course approval -> elasticsearch index ---
    public static final String COURSE_SEARCH_INDEX_QUEUE = "course.search.index.queue";
    public static final String COURSE_SEARCH_INDEX_DLX = "course.search.index.dlx";
    public static final String COURSE_SEARCH_INDEX_DLQ = "course.search.index.dlq";
    public static final String COURSE_SEARCH_INDEX_DLQ_ROUTING_KEY = "course.search.index.dead";

    @Bean
    public Queue registerCourseQueue () {
        return new Queue(REGISTER_SERVICE_QUEUE, true);
    }

    @Bean
    public TopicExchange sagaExchange() {
        return new TopicExchange(SAGA_EXCHANGE, true, false);
    }

    @Bean
    public DirectExchange userNotificationExchange() {
        return new DirectExchange(USER_NOTIFICATION_EXCHANGE, true, false);
    }

    @Bean
    public Queue studyReminderQueue() {
        return new Queue(STUDY_REMINDER_QUEUE, true);
    }

    @Bean
    public Binding bindingStudyReminder(Queue studyReminderQueue, DirectExchange userNotificationExchange) {
        return BindingBuilder
                .bind(studyReminderQueue)
                .to(userNotificationExchange)
                .with(STUDY_REMINDER_ROUTING_KEY);
    }

    @Bean
    public Queue certificateIssuedQueue() {
        return new Queue(CERTIFICATE_ISSUED_QUEUE, true);
    }

    @Bean
    public Binding bindingCertificateIssued(Queue certificateIssuedQueue, DirectExchange userNotificationExchange) {
        return BindingBuilder
                .bind(certificateIssuedQueue)
                .to(userNotificationExchange)
                .with(CERTIFICATE_ISSUED_ROUTING_KEY);
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

    @Bean
    public Queue assistantCourseEmbeddingQueue() {
        return new Queue(ASSISTANT_COURSE_EMBEDDING_QUEUE, true);
    }

    @Bean
    public Binding bindingAssistantCourseEmbedding(Queue assistantCourseEmbeddingQueue, TopicExchange courseApprovalExchange) {
        return BindingBuilder
                .bind(assistantCourseEmbeddingQueue)
                .to(courseApprovalExchange)
                .with(COURSE_APPROVAL_ROUTING_KEY);
    }

    @Bean
    public DirectExchange courseSearchIndexDlqExchange() {
        return new DirectExchange(COURSE_SEARCH_INDEX_DLX, true, false);
    }

    @Bean
    public Queue courseSearchIndexDlq() {
        return new Queue(COURSE_SEARCH_INDEX_DLQ, true);
    }

    @Bean
    public Binding bindingCourseSearchIndexDlq(
            Queue courseSearchIndexDlq,
            DirectExchange courseSearchIndexDlqExchange
    ) {
        return BindingBuilder
                .bind(courseSearchIndexDlq)
                .to(courseSearchIndexDlqExchange)
                .with(COURSE_SEARCH_INDEX_DLQ_ROUTING_KEY);
    }

    @Bean
    public Queue courseSearchIndexQueue() {
        return QueueBuilder.durable(COURSE_SEARCH_INDEX_QUEUE)
                .withArgument("x-dead-letter-exchange", COURSE_SEARCH_INDEX_DLX)
                .withArgument("x-dead-letter-routing-key", COURSE_SEARCH_INDEX_DLQ_ROUTING_KEY)
                .build();
    }

    @Bean
    public Binding bindingCourseSearchIndex(Queue courseSearchIndexQueue, TopicExchange courseApprovalExchange) {
        return BindingBuilder
                .bind(courseSearchIndexQueue)
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
    public MessageConverter messageConverter(com.fasterxml.jackson.databind.ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter messageConverter) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(messageConverter);
        return rabbitTemplate;
    }

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter(com.fasterxml.jackson.databind.ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
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

    @Bean
    public SimpleRabbitListenerContainerFactory courseSearchIndexListenerContainerFactory(
            ConnectionFactory connectionFactory,
            Jackson2JsonMessageConverter messageConverter,
            Advice courseSearchIndexRetryAdvice) {

        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(messageConverter);
        factory.setAcknowledgeMode(AcknowledgeMode.AUTO);
        factory.setDefaultRequeueRejected(false);
        factory.setAdviceChain(courseSearchIndexRetryAdvice);
        return factory;
    }
}
