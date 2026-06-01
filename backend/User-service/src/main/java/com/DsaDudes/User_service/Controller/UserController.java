package com.DsaDudes.User_service.Controller;

import com.DsaDudes.User_service.DTO.UserDTO;
import com.DsaDudes.User_service.Models.User;
import com.DsaDudes.User_service.Repository.UserRepository;
import com.DsaDudes.User_service.Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;


//    ===============================   PUBLIC ENDPOINTS =======================================

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authHeader.substring(7); // Remove "Bearer "
        User user = userService.getUserFromToken(token); // We'll implement this in UserService

        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(user);
    }

    // Getting User stats ===================
    @GetMapping("/stats")
    public ResponseEntity<?> getUserStats(@RequestHeader("Authorization") String token) {
        if (!token.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token Invalid..!"));
        }

        String cleanToken = token.substring(7);
        return ResponseEntity.ok(userService.getUserStats(cleanToken));
    }

    // Increment submission count ================
    @PutMapping("/{userId}/increment-submissions")
    public ResponseEntity<?> incrementSubmissions(@PathVariable int userId) {
        try {
            userService.incrementSubmissionCount(userId);
            return ResponseEntity.ok(Map.of("message", "Submission count incremented successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Increment solved count by difficulty ================
    @PutMapping("/{userId}/increment-solved")
    public ResponseEntity<?> incrementSolved(
            @PathVariable int userId,
            @RequestParam String difficulty
    ) {
        try {
            // Validating early so we don't hit the DB for garbage data
            String upperDiff = difficulty.toUpperCase();
            if (!upperDiff.equals("EASY") && !upperDiff.equals("MEDIUM") && !upperDiff.equals("HARD")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid difficulty. Use EASY, MEDIUM, or HARD"));
            }

            userService.incrementSolvedCount(userId, upperDiff);
            return ResponseEntity.ok(Map.of("message", upperDiff + " solved count incremented successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
