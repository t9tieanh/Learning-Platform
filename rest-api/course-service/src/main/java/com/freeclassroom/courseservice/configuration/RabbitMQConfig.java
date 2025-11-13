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
