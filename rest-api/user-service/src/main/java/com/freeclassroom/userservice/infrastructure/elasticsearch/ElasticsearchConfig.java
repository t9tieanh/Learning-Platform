package com.freeclassroom.userservice.infrastructure.elasticsearch;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(ElasticsearchProperties.class)
@RequiredArgsConstructor
public class ElasticsearchConfig {

    @Bean
    public RestClient elasticsearchRestClient(ElasticsearchProperties props) {
        return RestClient.builder()
                .baseUrl(props.getUrl())
                .requestFactory(clientHttpRequestFactory())
                .build();
    }

    private ClientHttpRequestFactory clientHttpRequestFactory() {
        SimpleClientHttpRequestFactory f = new SimpleClientHttpRequestFactory();
        f.setConnectTimeout(2_000);
        f.setReadTimeout(5_000);
        return f;
    }
}
