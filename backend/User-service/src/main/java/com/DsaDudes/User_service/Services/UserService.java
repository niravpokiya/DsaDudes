package com.DsaDudes.User_service.Services;

import com.DsaDudes.User_service.DTO.UserDTO;
import com.DsaDudes.User_service.Enums.Role;
import com.DsaDudes.User_service.Models.User;
import com.DsaDudes.User_service.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JWTService jwtService;
    public ResponseEntity<Map<String, Object>> registerUser(UserDTO user) {
        Map<String, Object> response = new HashMap<>();

        if (userRepository.existsUserByEmail(user.email)) {
            response.put("error", "Email Already Exists");
            return ResponseEntity.badRequest().body(response);
        }

        if (userRepository.existsUserByUsername(user.username)) {
            response.put("error", "Username Already Exists");
            return ResponseEntity.badRequest().body(response);
        }

        User newUser = new User();
        newUser.setUsername(user.username);
        newUser.setPassword(passwordEncoder.encode(user.password));
        newUser.setEmail(user.email);
        newUser.setRole(Role.USER);
        userRepository.save(newUser);

        response.put("message", "success !");
        return ResponseEntity.ok(response);
    }

    public ResponseEntity<Map<String, Object>> verify(UserDTO user) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
        );

        if (auth.isAuthenticated()) {
            User existingUser = userRepository.findByUsername(user.getUsername());
            String token = jwtService.generateJWTToken(user);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", new UserDTO(existingUser));
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
        }
    }

    public User findUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.isAuthenticated() == false || auth.getPrincipal() == null) {
            return null;
        }
        String username = auth.getName();
        return userRepository.findByUsername(username);
    }

    public User getUserFromToken(String token) {
        try {
            String username = jwtService.extractUsername(token);
            return userRepository.findByUsername(username);
        } catch (Exception e) {
            return null; // invalid token
        }
    }

}
