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
    public ResponseEntity<String> registerUser(UserDTO user) {
        if(userRepository.existsUserByEmail(user.email)) {
            return ResponseEntity.badRequest().body("Email Already Exists");
        }
        if(userRepository.existsUserByUsername(user.username)) {
            return ResponseEntity.badRequest().body("Username Already Exists");
        }
        User newUser = new User();

        newUser.setUsername(user.username);
        newUser.setPassword(passwordEncoder.encode(user.password));
        newUser.setEmail(user.email);
        newUser.setRole(Role.USER);
        userRepository.save(newUser);

        return ResponseEntity.ok().body("success !");
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
