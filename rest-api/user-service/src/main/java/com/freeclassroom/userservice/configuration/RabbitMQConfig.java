package com.freeclassroom.userservice.configuration;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    public static final String EXCHANGE = "user-notification-exchange";

    //queue
    public static final String VERIFY_REGISTER_QUEUE = "verify-email";
    public static final String FORGOT_PASSWORD_QUEUE = "forgot-password-queue";

    //routing key
    public static final String VERIFY_REGISTER_ROUTING_KEY = "user.verify.register";
    public static final String FORGOT_PASSWORD_ROUTING_KEY = "user.forgot.password";

    @Bean
    public DirectExchange exchange() {
        return new DirectExchange(EXCHANGE, true, false);
    }

    @Bean
    public Queue verifyRegisterQueue() {
        return new Queue(VERIFY_REGISTER_QUEUE, true);
    }

    @Bean
    public Queue forgotPasswordQueue() {
        return new Queue(FORGOT_PASSWORD_QUEUE, true);
    }
    

    @Bean
    public Binding bindingVerifyRegister(Queue verifyRegisterQueue, DirectExchange userNotificationExchange) {
        return BindingBuilder.bind(verifyRegisterQueue)
                .to(userNotificationExchange)
                .with(VERIFY_REGISTER_ROUTING_KEY);
    }

    @Bean
    public Binding bindingForgotPassword(Queue forgotPasswordQueue, DirectExchange userNotificationExchange) {
        return BindingBuilder.bind(forgotPasswordQueue)
                .to(userNotificationExchange)
                .with(FORGOT_PASSWORD_ROUTING_KEY);
    }

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
}
