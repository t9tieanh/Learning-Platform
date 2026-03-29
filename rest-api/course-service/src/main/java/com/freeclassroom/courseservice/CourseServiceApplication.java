package com.freeclassroom.courseservice;

//import com.freeclassroom.courseservice.configuration.LessonUploadProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
//import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;

@SpringBootApplication
@EnableFeignClients
@EnableRedisRepositories
@EnableJpaAuditing
//@EnableConfigurationProperties(LessonUploadProperties.class)
public class CourseServiceApplication {
	public static void main(String[] args) {
		SpringApplication.run(CourseServiceApplication.class, args);
	}
}
