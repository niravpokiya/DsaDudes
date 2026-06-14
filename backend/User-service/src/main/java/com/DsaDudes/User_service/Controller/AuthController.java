package com.DsaDudes.User_service.Controller;

import java.time.Duration;
import java.util.Map;

import com.DsaDudes.User_service.Services.TokenBlacklistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.DsaDudes.User_service.DTO.UserDTO;
import com.DsaDudes.User_service.DTO.UserLoginRequest;
import com.DsaDudes.User_service.Services.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    public UserService userService;
    @Autowired
    public TokenBlacklistService tokenBlacklistService;

    @PostMapping("/register")
    public ResponseEntity<Map<String,Object>> register(@RequestBody UserDTO user) {
        return userService.registerUser(user);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody UserLoginRequest user) {
        return userService.verify(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        tokenBlacklistService.blacklist(token, Duration.ofDays(1));
        return ResponseEntity.ok().build();
    }
}
