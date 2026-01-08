package com.freeclassroom.courseservice.service.utils.file;

import com.freeclassroom.courseservice.dto.utils.UploadProgressEvent;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;

import java.io.IOException;

public interface IUploadFileService {
    String uploadFile(MultipartFile file);
    Flux<UploadProgressEvent> uploadFileWithProgress(MultipartFile multipartFile) throws IOException;
}
