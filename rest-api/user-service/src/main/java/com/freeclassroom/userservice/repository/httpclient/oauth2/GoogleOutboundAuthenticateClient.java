package com.freeclassroom.userservice.repository.httpclient.oauth2;

import com.freeclassroom.userservice.dto.request.outbound.oauth2.GoogleExchanceTokenRequest;
import com.freeclassroom.userservice.dto.response.outbound.oauth2.GoogleExchangeTokenResponse;
import feign.QueryMap;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(name = "outbound-identity", url = "https://oauth2.googleapis.com")
public interface GoogleOutboundAuthenticateClient {
    @PostMapping(value = "/token", produces = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    GoogleExchangeTokenResponse exchanceToken(@QueryMap GoogleExchanceTokenRequest request);
}
