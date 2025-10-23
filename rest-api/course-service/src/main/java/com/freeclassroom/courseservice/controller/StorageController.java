package com.freeclassroom.courseservice.controller;

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
import reactor.core.publisher.Flux;

import java.io.IOException;
import java.util.Arrays;

import static org.springframework.http.MediaTypeFactory.getMediaType;

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
    public ResponseEntity<Resource> getFile(
            @PathVariable String id,
            @RequestHeader(value = "Range", required = false) String rangeHeader) {

        try {
            byte[] fileBytes = cloudFrontService.getFile(id);
            String fileName = id.substring(id.lastIndexOf('/') + 1);

            MediaType mediaType = MediaTypeFactory
                    .getMediaType(fileName)
                    .orElse(MediaType.APPLICATION_OCTET_STREAM);

            ByteArrayResource resource = new ByteArrayResource(fileBytes);

            if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
                String[] ranges = rangeHeader.replace("bytes=", "").split("-");
                long start = Long.parseLong(ranges[0]);
                long end = ranges.length > 1 && !ranges[1].isEmpty()
                        ? Long.parseLong(ranges[1])
                        : fileBytes.length - 1;

                if (end >= fileBytes.length) end = fileBytes.length - 1;

                byte[] partialData = Arrays.copyOfRange(fileBytes, (int) start, (int) end + 1);
                ByteArrayResource partialResource = new ByteArrayResource(partialData);

                return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                        .header(HttpHeaders.CONTENT_TYPE, mediaType.toString())
                        .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                        .header(HttpHeaders.CONTENT_RANGE,
                                String.format("bytes %d-%d/%d", start, end, fileBytes.length))
                        .contentLength(partialData.length)
                        .body(partialResource);
            }

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
