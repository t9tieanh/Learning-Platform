package com.freeclassroom.userservice.utils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
@Slf4j
public class FileUtils {

    /**
     * Writes multipart content to the JVM temp directory (writable in Docker non-root).
     */
    public File convertMultiPartToFile(MultipartFile file) throws IOException {
        String original = file.getOriginalFilename();
        String suffix = ".tmp";
        if (original != null && original.contains(".")) {
            suffix = original.substring(original.lastIndexOf('.'));
        }
        Path tempPath = Files.createTempFile("upload-", suffix);
        Files.write(tempPath, file.getBytes());
        File convFile = tempPath.toFile();
        convFile.deleteOnExit();
        return convFile;
    }
}
