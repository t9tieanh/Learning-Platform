package com.freeclassroom.courseservice.controller.user;

import com.freeclassroom.courseservice.service.utils.cloudfront.ICloudFrontService;
import com.freeclassroom.courseservice.service.utils.file.IUploadFileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import static org.springframework.http.MediaTypeFactory.getMediaType;

@RestController
@RequestMapping("/storage")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class StorageController {
    IUploadFileService uploadFileService;
    ICloudFrontService  cloudFrontService;

    @PostMapping("/upload-file")
    public String uploadFile(@RequestPart(value = "file") MultipartFile file) {
        return this.uploadFileService.uploadFile(file);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getFile(
            @PathVariable String id,
            @RequestHeader(value = "Range", required = false) String rangeHeader) {

        try {
            if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
                return cloudFrontService.streamFile(id, rangeHeader);
            }

            byte[] fileBytes = cloudFrontService.getFile(id);
            String fileName = id.substring(id.lastIndexOf('/') + 1);

            MediaType mediaType = MediaTypeFactory
                    .getMediaType(fileName)
                    .orElse(MediaType.APPLICATION_OCTET_STREAM);

            ByteArrayResource resource = new ByteArrayResource(fileBytes);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .contentType(mediaType)
                    .contentLength(fileBytes.length)
                    .body(resource);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
