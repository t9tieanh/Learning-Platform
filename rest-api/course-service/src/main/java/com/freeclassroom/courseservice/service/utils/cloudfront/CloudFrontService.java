package com.freeclassroom.courseservice.service.utils.cloudfront;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import javax.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import software.amazon.awssdk.services.cloudfront.CloudFrontUtilities;
import software.amazon.awssdk.services.cloudfront.model.CannedSignerRequest;
import software.amazon.awssdk.services.cloudfront.url.SignedUrl;

import java.net.URI;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class CloudFrontService implements ICloudFrontService {

    @NonFinal
    private CloudFrontUtilities cloudFrontUtilities;

    @Value("${aws.cloudfront.distributionDomainName}")
    @NonFinal
    private String distributionDomainName;

    @Value("${aws.key-store}")
    @NonFinal
    String keyStore;

    @Value("${aws.cloudfront.privateKeyPath}")
    @NonFinal
    private Resource privateKeyResource;

    @Value("${aws.cloudfront.keyPairId}")
    @NonFinal
    private String keyPairId;

    @Value("${aws.cloudfront.defaultExpireDays:7}")
    @NonFinal
    private long defaultExpireDays;

    StringRedisTemplate redisTemplate;

    @PostConstruct
    public void init() {
        this.cloudFrontUtilities = CloudFrontUtilities.create();
    }

    private SignedUrl generateSignedUrlCanned(String resourcePath) throws Exception {
        String safePath = resourcePath.replace(" ", "%20");
        String normalizedPath = safePath.startsWith("/") ? safePath : "/" + safePath;
        String fullUrl = "https://" + distributionDomainName + "/" + keyStore + normalizedPath;

        Instant expiration = Instant.now().plus(defaultExpireDays, ChronoUnit.DAYS);
        Path privateKey = privateKeyResource.getFile().toPath();

        CannedSignerRequest req = CannedSignerRequest.builder()
                .resourceUrl(fullUrl)
                .privateKey(privateKey)
                .keyPairId(keyPairId)
                .expirationDate(expiration)
                .build();

        SignedUrl signed = cloudFrontUtilities.getSignedUrlWithCannedPolicy(req);
        log.info("Generated signed URL (expire at {}): {}", expiration, signed.url());
        return signed;
    }

    @Override
    public String getSignedUrl(String resourcePath) throws Exception {
        String redisKey = "cloudfront:signedUrl:" + resourcePath;

        String cachedUrl = redisTemplate.opsForValue().get(redisKey);
        if (cachedUrl != null) {
            return cachedUrl;
        }

        SignedUrl signedUrl = this.generateSignedUrlCanned(resourcePath);
        String url = signedUrl.url();

        long ttlSeconds = Duration.ofDays(defaultExpireDays).toSeconds();
        redisTemplate.opsForValue().set(redisKey, url, Duration.ofSeconds(ttlSeconds));

        return url;
    }

    @Override
    public byte[] getFile(String resourcePath) throws Exception {
        String signedUrl = this.getSignedUrl(resourcePath);

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.USER_AGENT, "Mozilla/5.0");
        headers.add(HttpHeaders.ACCEPT, "*/*");

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        URI uri = new URI(signedUrl); // Không dùng new URL()

        ResponseEntity<byte[]> response = restTemplate.exchange(uri, HttpMethod.GET, entity, byte[].class);
        return response.getBody();
    }

    @Override
    public ResponseEntity<Resource> streamFile(String resourcePath, String rangeHeader) throws Exception {
        String signedUrl = this.getSignedUrl(resourcePath);

        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory(httpClient);
        RestTemplate restTemplate = new RestTemplate(factory);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.USER_AGENT, "Mozilla/5.0");
        headers.add(HttpHeaders.ACCEPT, "*/*");

        if (rangeHeader != null && !rangeHeader.isEmpty()) {
            headers.add(HttpHeaders.RANGE, rangeHeader);
        }

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        URI uri = new URI(signedUrl);

        ResponseEntity<byte[]> response = restTemplate.exchange(uri, HttpMethod.GET, entity, byte[].class);

        HttpHeaders responseHeaders = new HttpHeaders();
        response.getHeaders().forEach((key, value) -> {
            if (HttpHeaders.CONTENT_TYPE.equalsIgnoreCase(key)
                    || HttpHeaders.CONTENT_LENGTH.equalsIgnoreCase(key)
                    || HttpHeaders.ACCEPT_RANGES.equalsIgnoreCase(key)
                    || HttpHeaders.CONTENT_RANGE.equalsIgnoreCase(key)) {
                responseHeaders.put(key, value);
            }
        });

        return ResponseEntity.status(response.getStatusCode())
                .headers(responseHeaders)
                .body(new ByteArrayResource(response.getBody()));
    }

}
