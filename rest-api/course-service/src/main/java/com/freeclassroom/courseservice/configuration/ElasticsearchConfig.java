package com.freeclassroom.courseservice.configuration;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import co.elastic.clients.transport.ElasticsearchTransport;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.apache.http.HttpHost;
import org.elasticsearch.client.RestClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.net.URI;

@Configuration
public class ElasticsearchConfig {

    @Bean
    public ElasticsearchClient elasticsearchClient(@Value("${app.elasticsearch.url}") String elasticsearchUrl) {
        URI uri = URI.create(elasticsearchUrl);

        String scheme = uri.getScheme() == null ? "http" : uri.getScheme();
        String host = uri.getHost();
        int port = uri.getPort();

        // If the url is like "http://host" then port == -1, so use the scheme default.
        if (port == -1) {
            port = "https".equalsIgnoreCase(scheme) ? 443 : 80;
        }

        RestClient restClient = RestClient.builder(new HttpHost(host, port, scheme)).build();

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        ElasticsearchTransport transport = new RestClientTransport(restClient, new JacksonJsonpMapper(objectMapper));
        return new ElasticsearchClient(transport);
    }
}
