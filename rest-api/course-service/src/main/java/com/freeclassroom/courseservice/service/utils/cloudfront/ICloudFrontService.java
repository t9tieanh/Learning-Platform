package com.freeclassroom.courseservice.service.utils.cloudfront;

import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;

public interface ICloudFrontService {
    String getSignedUrl(String resourcePath) throws Exception;
    byte[] getFile(String resourcePath) throws Exception;
    ResponseEntity<Resource> streamFile(String resourcePath, String rangeHeader) throws Exception;
}
