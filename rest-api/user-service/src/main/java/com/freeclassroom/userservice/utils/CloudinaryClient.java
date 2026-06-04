package com.freeclassroom.userservice.utils;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.freeclassroom.userservice.exception.CustomExeption;
import com.freeclassroom.userservice.exception.ErrorCode;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class CloudinaryClient {
    Cloudinary cloudinaryConfig;

    public String uploadFile(MultipartFile file) {
        try {
            Map<String, Object> options = new HashMap<>();
            String contentType = file.getContentType();
            if (contentType != null && contentType.startsWith("image/")) {
                options.put("resource_type", "image");
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinaryConfig.uploader().upload(file.getBytes(), options);
            Object url = uploadResult.get("secure_url");
            if (url == null) {
                url = uploadResult.get("url");
            }
            if (url == null) {
                throw new CustomExeption(ErrorCode.FILE_UPLOAD_FAILED);
            }
            return url.toString();
        } catch (CustomExeption e) {
            throw e;
        } catch (Exception e) {
            log.error("Cloudinary upload failed", e);
            throw new CustomExeption(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }
}
