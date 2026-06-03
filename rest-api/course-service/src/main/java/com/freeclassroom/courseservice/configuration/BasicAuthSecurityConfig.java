package com.freeclassroom.courseservice.configuration;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableConfigurationProperties(BasicAuthProperties.class)
@RequiredArgsConstructor
@Conditional(BasicAuthConfiguredCondition.class)
public class BasicAuthSecurityConfig {

    private final BasicAuthProperties basicAuthProperties;

    @Bean
    @Order(0)
    SecurityFilterChain basicAuthSecurityFilterChain(HttpSecurity http) throws Exception {
        String[] pathMatchers = basicAuthProperties.getPaths().toArray(String[]::new);

        UserDetailsService userDetailsService = new InMemoryUserDetailsManager(
                User.builder()
                        .username(basicAuthProperties.getUsername())
                        .password("{noop}" + basicAuthProperties.getPassword())
                        .roles("BASIC_AUTH")
                        .build()
        );

        http
                .securityMatcher(pathMatchers)
                .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                .httpBasic(httpBasic -> httpBasic.realmName(basicAuthProperties.getRealm()))
                .userDetailsService(userDetailsService)
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(
                        org.springframework.security.config.http.SessionCreationPolicy.STATELESS));

        return http.build();
    }
}
