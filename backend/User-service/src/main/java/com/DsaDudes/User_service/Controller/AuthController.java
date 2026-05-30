package com.DsaDudes.User_service.Controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.DsaDudes.User_service.DTO.UserDTO;
import com.DsaDudes.User_service.DTO.UserLoginRequest;
import com.DsaDudes.User_service.Services.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    public UserService userService;

    @PostMapping("/register")
    public ResponseEntity<Map<String,Object>> register(@RequestBody UserDTO user) {
        return userService.registerUser(user);
    }
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody UserLoginRequest user) {
        return userService.verify(user);
    }
}
