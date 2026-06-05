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

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class UploadFileService implements IUploadFileService {
    CloudinaryClient cloudinaryClient;

    @Override
    public String uploadFile(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new CustomExeption(ErrorCode.INVALID_KEY);
        }
        return cloudinaryClient.uploadFile(file);
    }
}
