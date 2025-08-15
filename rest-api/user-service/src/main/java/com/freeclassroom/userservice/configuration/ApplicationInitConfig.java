package com.freeclassroom.userservice.configuration;

import com.freeclassroom.userservice.entity.role.RoleAssignmentEntity;
import com.freeclassroom.userservice.entity.role.RoleEntity;
import com.freeclassroom.userservice.entity.user.UserEntity;
import com.freeclassroom.userservice.enums.entity.EnumAccountStatus;
import com.freeclassroom.userservice.repository.entity.RoleRepository;
import com.freeclassroom.userservice.repository.entity.UserRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

import java.util.HashSet;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {

    PasswordEncoder passwordEncoder;

    @NonFinal
    static final String ADMIN_ROLE = "admin";

    @NonFinal
    static final String TEACHER_ROLE = "teacher";

    @NonFinal
    static final String ADMIN_USER_NAME = "admin";

    @NonFinal
    static final String ADMIN_PASSWORD = "admin";

    @Bean
    @ConditionalOnProperty(
            prefix = "spring.datasource",
            name = "driver-class-name",
            havingValue = "com.mysql.cj.jdbc.Driver"
    )
    ApplicationRunner applicationRunner(UserRepository userRepository, RoleRepository roleRepository) {
        log.info("Initializing application.....");
        return args -> {
            if (roleRepository.findByName(ADMIN_ROLE) == null) {
                // add role admin
                RoleEntity adminRole =
                        roleRepository.save(
                                RoleEntity.builder().name(ADMIN_ROLE).description("This Is Admin Role").build()
                        );


                var roles = new HashSet<RoleAssignmentEntity>();
                roles.add(RoleAssignmentEntity.builder().role(adminRole).build());

                // thêm user admin
                UserEntity user = UserEntity.builder()
                        .username(ADMIN_USER_NAME)
                        .email("admin@tienanh194.com")
                        .password(passwordEncoder.encode(ADMIN_PASSWORD))
                        .roles(roles)
                        .status(EnumAccountStatus.ACTIVE)
                        .build();

                userRepository.save(user);
                log.warn("admin user has been created with default password: admin, please change it");
            }

            if (roleRepository.findByName(TEACHER_ROLE) == null) {
                //add role teacher
                roleRepository.save(
                        RoleEntity.builder().name(TEACHER_ROLE).description("This Is Teacher Role").build()
                );
            }
            log.info("Application initialization completed .....");
        };
    }
}
