package com.DsaDudes.User_service.Services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.DsaDudes.User_service.DTO.AdminUserDTO;
import com.DsaDudes.User_service.DTO.UserDTO;
import com.DsaDudes.User_service.DTO.UserLoginRequest;
import com.DsaDudes.User_service.Enums.Role;
import com.DsaDudes.User_service.Models.User;
import com.DsaDudes.User_service.Repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class UserService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private JWTService jwtService;

    public ResponseEntity<Map<String, Object>> registerUser(UserDTO user) {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> fieldErrors = new HashMap<>();

        if (user.username == null || user.username.trim().isEmpty()) {
            fieldErrors.put("username", "Username is required.");
        } else if (user.username.trim().length() < 3) {
            fieldErrors.put("username", "Username must be at least 3 characters.");
        }

        if (user.email == null || user.email.trim().isEmpty()) {
            fieldErrors.put("email", "Email is required.");
        } else if (!EMAIL_PATTERN.matcher(user.email.trim()).matches()) {
            fieldErrors.put("email", "Enter a valid email address.");
        }

        if (user.password == null || user.password.length() < 8) {
            fieldErrors.put("password", "Password must be at least 8 characters.");
        }

        if (!fieldErrors.isEmpty()) {
            response.put("error", "Please fix the highlighted fields.");
            response.put("fieldErrors", fieldErrors);
            return ResponseEntity.badRequest().body(response);
        }

        if (userRepository.existsUserByEmail(user.email)) {
            response.put("error", "Email already exists.");
            return ResponseEntity.badRequest().body(response);
        }

        if (userRepository.existsUserByUsername(user.username)) {
            response.put("error", "Username already exists.");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            User newUser = new User();
            newUser.setUsername(user.username);
            newUser.setPassword(passwordEncoder.encode(user.password));
            newUser.setEmail(user.email);
            newUser.setRole(Role.USER);
            userRepository.save(newUser);

            response.put("message", "Registration successful.");
            return ResponseEntity.ok(response);
        } catch (DataIntegrityViolationException exception) {
            response.put("error", "Unable to create account. Please check the provided details.");
            return ResponseEntity.badRequest().body(response);
        }
    }

    public ResponseEntity<Map<String, Object>> verify(UserLoginRequest user) {
        Map<String, Object> response = new HashMap<>();

        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.username, user.password)
            );

            if (auth.isAuthenticated()) {
                User existingUser = userRepository.findByUsername(user.username);
                String token = jwtService.generateToken(existingUser);

                response.put("token", token);
                response.put("user", new UserDTO(existingUser));

                return ResponseEntity.ok(response);
            }
        } catch (BadCredentialsException exception) {
            response.put("error", "Invalid username or password.");
            return ResponseEntity.status(401).body(response);
        } catch (RuntimeException exception) {
            response.put("error", "Unable to sign in. Please try again.");
            return ResponseEntity.status(500).body(response);
        }

        response.put("error", "Invalid username or password.");
        return ResponseEntity.status(401).body(response);
    }

    public User getUserFromToken(String token) {
        try {
            String username = jwtService.extractUsername(token);
            return userRepository.findByUsername(username);
        } catch (Exception e) {
            return null;
        }
    }

    // Getting user stats -----------------------------------
    public Map<String, Integer> getUserStats(String token) {
        User user = getUserFromToken(token);
        if (user == null) {
            throw new RuntimeException("Invalid token");
        }

        return Map.of(
                "totalSubmissions", user.getTotalSubmissions(),
                "totalSolved", user.getSolvedCount(),
                "easySolved", user.getEasySolvedCount(),
                "mediumSolved", user.getMediumSolvedCount(),
                "hardSolved", user.getHardSolvedCount()
        );
    }

    public List<AdminUserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(AdminUserDTO::new)
                .toList();
    }

    @Transactional
    public void incrementSubmissionCount(int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setTotalSubmissions(user.getTotalSubmissions() + 1);
        userRepository.save(user);
    }

    @Transactional
    public void incrementSolvedCount(int userId, String difficulty) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setSolvedCount(user.getSolvedCount() + 1);

        switch (difficulty.toUpperCase()) {
            case "EASY" -> user.setEasySolvedCount(user.getEasySolvedCount() + 1);
            case "MEDIUM" -> user.setMediumSolvedCount(user.getMediumSolvedCount() + 1);
            case "HARD" -> user.setHardSolvedCount(user.getHardSolvedCount() + 1);
        }
        userRepository.save(user);
    }
}