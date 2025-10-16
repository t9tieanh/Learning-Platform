package com.freeclassroom.courseservice.service.utils.file;

import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.exception.ErrorCode;
import com.freeclassroom.courseservice.service.utils.cloudinary.CloudinaryClient;
import com.freeclassroom.courseservice.service.utils.s3.AmazonS3Client;
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
    AmazonS3Client amazonS3Client;

    @Override
    public String uploadFile(MultipartFile file) {
        try {
            String contentType = file.getContentType();
            if (contentType == null) {
                throw new CustomExeption(ErrorCode.FILE_TYPE_INVALID);
            }

            //check if is image
            if (contentType.startsWith("image/")) {
                return cloudinaryClient.uploadFile(file);
            } else {
                return amazonS3Client.uploadFile(file);
            }
        } catch (Exception e) {
            log.error("Upload failed", e);
            throw new CustomExeption(ErrorCode.UPLOAD_NOT_COMPLETED);
        }
    }
}
