package com.freeclassroom.courseservice.service.certificate;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Base64;

@Component
@Slf4j
public class CertificateImageLoader {

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(8))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    public String classpathToDataUri(String resourcePath, String mimeType) {
        try (InputStream stream = getClass().getResourceAsStream(resourcePath)) {
            if (stream == null) {
                log.warn("Classpath resource not found for certificate PDF: {}", resourcePath);
                return null;
            }
            byte[] bytes = stream.readAllBytes();
            if (bytes.length == 0) {
                return null;
            }
            return "data:" + mimeType + ";base64," + Base64.getEncoder().encodeToString(bytes);
        } catch (Exception e) {
            log.warn("Could not load classpath image for certificate PDF: {} - {}", resourcePath, e.getMessage());
            return null;
        }
    }

    public String toDataUri(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return null;
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(imageUrl))
                    .timeout(Duration.ofSeconds(15))
                    .GET()
                    .header("User-Agent", "Learnova-Certificate-PDF/1.0")
                    .build();

            HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                log.warn("Failed to load image for certificate PDF: {} status={}", imageUrl, response.statusCode());
                return null;
            }

            byte[] bytes;
            try (InputStream stream = response.body()) {
                bytes = stream.readAllBytes();
            }

            if (bytes.length == 0) {
                return null;
            }

            String contentType = response.headers().firstValue("Content-Type")
                    .orElse(guessMimeType(imageUrl));
            if (!contentType.startsWith("image/")) {
                contentType = guessMimeType(imageUrl);
            }

            return "data:" + contentType + ";base64," + Base64.getEncoder().encodeToString(bytes);
        } catch (Exception e) {
            log.warn("Could not embed image in certificate PDF: {} - {}", imageUrl, e.getMessage());
            return null;
        }
    }

    private String guessMimeType(String url) {
        String lower = url.toLowerCase();
        if (lower.contains(".png")) {
            return "image/png";
        }
        if (lower.contains(".webp")) {
            return "image/webp";
        }
        if (lower.contains(".gif")) {
            return "image/gif";
        }
        return "image/jpeg";
    }
}
