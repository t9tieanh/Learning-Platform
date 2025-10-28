package com.freeclassroom.courseservice.controller.user;

import com.example.grpc.user.GetUserResponse;
import com.freeclassroom.courseservice.grpc.client.UserGrpcClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;


@RestController
public class TestController {

    private final UserGrpcClient userGrpcClient;

    public TestController(UserGrpcClient helloClientService) {
        this.userGrpcClient = helloClientService;
    }

    @GetMapping("/test")
    public Map<String, Object> test() {

        GetUserResponse resp = userGrpcClient.getUser("3acc3b78-a88c-4511-a6a0-2aab20372a00");

        System.out.println("resp" + resp);

        Map<String, Object> result = new HashMap<>();
        result.put("id", resp.getId());
        result.put("name", resp.getName());
        result.put("image", resp.getImage());
        result.put("phone", resp.getPhone());
        result.put("description", resp.getDescription());
        result.put("email", resp.getEmail());
        result.put("username", resp.getUsername());
        result.put("status", resp.getStatus().name());
        result.put("roles", resp.getRolesList());

        return result;
    }

}