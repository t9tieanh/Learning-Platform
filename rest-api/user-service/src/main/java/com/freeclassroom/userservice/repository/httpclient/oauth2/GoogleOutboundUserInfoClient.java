package com.freeclassroom.userservice.repository.httpclient.oauth2;

import com.freeclassroom.userservice.dto.response.outbound.oauth2.GoogleGetUserInfo;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "outbound-user", url = "https://www.googleapis.com")
public interface GoogleOutboundUserInfoClient {
    @GetMapping(value = "oauth2/v1/userinfo")
    GoogleGetUserInfo getUserInfo (@RequestParam("alt") String alt, @RequestParam("access_token") String accessToken);
}
