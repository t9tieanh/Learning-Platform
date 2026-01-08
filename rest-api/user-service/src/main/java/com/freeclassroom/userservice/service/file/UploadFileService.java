package com.freeclassroom.userservice.service.file;

import com.freeclassroom.userservice.exception.CustomExeption;
import com.freeclassroom.userservice.exception.ErrorCode;
import com.freeclassroom.userservice.utils.CloudinaryClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;

import java.io.IOException;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class UploadFileService implements IUploadFileService {
    CloudinaryClient cloudinaryClient;

    @Override
    public String uploadFile(MultipartFile file) {
        try {
            String contentType = file.getContentType();
            if (contentType == null) {
                throw new CustomExeption(ErrorCode.UNCATEGORIZED_EXEPTION);
            }

            //check if is
            if (contentType.startsWith("image/")) {
                return cloudinaryClient.uploadFile(file);
            }
            return cloudinaryClient.uploadFile(file);
        } catch (Exception e) {
            log.error("Upload failed", e);
            throw new CustomExeption(ErrorCode.UNCATEGORIZED_EXEPTION);
        }
    }
}
