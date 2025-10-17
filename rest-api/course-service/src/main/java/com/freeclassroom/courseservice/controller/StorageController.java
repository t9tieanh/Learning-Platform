package com.freeclassroom.courseservice.controller;

import com.freeclassroom.courseservice.service.utils.cloudfront.ICloudFrontService;
import com.freeclassroom.courseservice.service.utils.file.IUploadFileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;

import java.io.IOException;

@RestController
@RequestMapping("/storage")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StorageController {
    IUploadFileService uploadFileService;
    ICloudFrontService  cloudFrontService;

    @PostMapping("/upload-file")
    public String uploadFile(@RequestPart(value = "file") MultipartFile file) {
        return this.uploadFileService.uploadFile(file);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getFile(@PathVariable String id) throws Exception {
        try {
            byte[] fileBytes = cloudFrontService.getFile(id);

            String fileName = id.substring(id.lastIndexOf('/') + 1);

            ByteArrayResource resource = new ByteArrayResource(fileBytes);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .contentLength(fileBytes.length)
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
