package com.freeclassroom.courseservice.configuration;

import lombok.RequiredArgsConstructor;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.SecurityFilterChain;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(
        prePostEnabled = true,
        securedEnabled = true,
        jsr250Enabled = true)
@RequiredArgsConstructor
@Slf4j
public class SecurityConfig {

    @NonFinal
    @Value("${spring.jwt.signerKey}")
    protected String SIGNER_KEY;

    private final CustomJwtDecoder jwtDecoder;

    private final String[] PUBLIC_ENDPOINTS = {"/categories/**", "/tags/**", "/test/**", "/storage/**", "/courses-user/**"};

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/courses/*/info").permitAll()
                        .requestMatchers(HttpMethod.GET, "/courses/*/tags").permitAll()
                        .requestMatchers(HttpMethod.GET, "/chapters-user/*/public").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, PUBLIC_ENDPOINTS).permitAll()
                        .requestMatchers(HttpMethod.GET, PUBLIC_ENDPOINTS).permitAll()
                        .requestMatchers(HttpMethod.GET, "/lesson-student/**").permitAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )
                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt -> jwt
                                .decoder(jwtDecoder)
                                .jwtAuthenticationConverter(this::jwtAuthenticationConverter) // custom ở đây
                        )
                );

        return httpSecurity.build();
    }

    private AbstractAuthenticationToken jwtAuthenticationConverter(Jwt jwt) {
        Collection<GrantedAuthority> authorities = new ArrayList<>();

        Object claim = jwt.getClaims().get("authorities"); // hoặc "roles"
        if (claim instanceof List<?>) {
            for (Object item : (List<?>) claim) {
                if (item instanceof String str) {
                    authorities.add(new SimpleGrantedAuthority(str));
                } else if (item instanceof Map<?, ?> map && map.get("authority") != null) {
                    authorities.add(new SimpleGrantedAuthority(map.get("authority").toString()));
                }
            }
        }

        return new JwtAuthenticationToken(jwt, authorities);
    }
}
