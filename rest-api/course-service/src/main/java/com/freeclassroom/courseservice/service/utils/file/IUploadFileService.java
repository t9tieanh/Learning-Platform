package com.freeclassroom.courseservice.service.utils.file;

import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;

import java.io.IOException;

public interface IUploadFileService {
    String uploadFile(MultipartFile file);
    Flux<Double> uploadFileWithProgress(MultipartFile multipartFile) throws IOException;
}
