package com.freeclassroom.courseservice.service.utils.cloudfront;

public interface ICloudFrontService {
    String getSignedUrl(String resourcePath) throws Exception;
    byte[] getFile(String resourcePath) throws Exception;
}
