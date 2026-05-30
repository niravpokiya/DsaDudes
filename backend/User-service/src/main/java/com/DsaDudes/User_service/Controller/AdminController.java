package com.DsaDudes.User_service.Controller;

import com.DsaDudes.User_service.DTO.AdminUserDTO;
import com.DsaDudes.User_service.Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<AdminUserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(Map.of(
                "data", users,
                "count", users.size()
        ));
    }
}