package com.DsaDudes.User_service.Controller;

import com.DsaDudes.User_service.DTO.UserDTO;
import com.DsaDudes.User_service.DTO.UserLoginRequest;
import com.DsaDudes.User_service.Models.User;
import com.DsaDudes.User_service.Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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
