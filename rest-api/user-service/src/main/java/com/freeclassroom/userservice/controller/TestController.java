package com.freeclassroom.userservice.controller;

import com.freeclassroom.userservice.grpc.HelloClientService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    private final HelloClientService helloClientService;

    public TestController(HelloClientService helloClientService) {
        this.helloClientService = helloClientService;
    }

    @GetMapping("/test")
    public String test() {
        return helloClientService.sayHello("Sang");
    }
}
