package com.freeclassroom.courseservice.service.utils.file;

import org.springframework.web.multipart.MultipartFile;

public interface IUploadFileService {
    String uploadFile(MultipartFile file);
}
