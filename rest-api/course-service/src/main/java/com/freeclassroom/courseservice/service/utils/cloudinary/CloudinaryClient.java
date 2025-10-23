package com.freeclassroom.courseservice.service.utils.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.freeclassroom.courseservice.service.utils.other.FileUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class CloudinaryClient {
    private Cloudinary cloudinaryConfig;
    private FileUtils fileUtils;

    public String uploadFile(MultipartFile file) {
        try {
            Map uploadResult = cloudinaryConfig.uploader().upload(
                    fileUtils.convertMultiPartToFile(file)
                    , ObjectUtils.emptyMap());
            return  uploadResult.get("url").toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}