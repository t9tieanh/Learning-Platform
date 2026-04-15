package com.freeclassroom.courseservice.service.utils.cloudfront;

import com.freeclassroom.courseservice.dto.response.course.CloudFrontCookieResponse;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;

public interface ICloudFrontService {
    String getSignedUrl(String resourcePath) throws Exception;
    String getSignedUrlWithIp(String resourcePath, String ipAddress) throws Exception;
    CloudFrontCookieResponse getSignedCookies(String resourcePath) throws Exception;
    CloudFrontCookieResponse getSignedCookiesWithIp(String resourcePath, String ipAddress) throws Exception;
    byte[] getFile(String resourcePath) throws Exception;
    ResponseEntity<Resource> streamFile(String resourcePath, String rangeHeader) throws Exception;
}
