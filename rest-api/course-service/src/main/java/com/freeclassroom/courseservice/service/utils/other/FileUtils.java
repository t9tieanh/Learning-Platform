package com.freeclassroom.courseservice.service.utils.other;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;

@Service
@Slf4j
public class FileUtils {
     public File convertMultiPartToFile(MultipartFile file) throws IOException {
        File convFile = new File(file.getOriginalFilename());
        FileOutputStream fos = new FileOutputStream(convFile);
        fos.write(file.getBytes());
        fos.close();
        return convFile;
    }

    public String toAsciiFileName(String originalFileName) {
        if (originalFileName == null || originalFileName.isBlank()) {
            return "file";
        }

        String normalized = Normalizer.normalize(originalFileName, Normalizer.Form.NFD);
        String noAccents = normalized
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replace("đ", "d")
                .replace("Đ", "D");

        String sanitized = noAccents
                .replaceAll("[\\s]+", "_")
                .replaceAll("[^A-Za-z0-9._-]", "_");

        return sanitized.isBlank() ? "file" : sanitized;
    }

    public String buildInlineContentDisposition(String originalFileName) {
        String asciiFileName = toAsciiFileName(originalFileName);
        String encodedFileName = encodeRFC5987(originalFileName != null ? originalFileName : asciiFileName);
        return "inline; filename=\"" + asciiFileName + "\"; filename*=UTF-8''" + encodedFileName;
    }

    private String encodeRFC5987(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8)
                .replace("+", "%20")
                .replace("*", "%2A")
                .replace("%7E", "~");
    }
}
