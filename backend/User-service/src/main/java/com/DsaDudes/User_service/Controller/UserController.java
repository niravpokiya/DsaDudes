package com.DsaDudes.User_service.Controller;

import com.DsaDudes.User_service.DTO.ProfileResponse;
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
    public ResponseEntity<ProfileResponse> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authHeader.substring(7); // Remove "Bearer "
        ProfileResponse profile = userService.getProfileFromToken(token);

        if (profile == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(profile);
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
        return ResponseEntity.status(410).body(Map.of(
                "error", "Solved statistics are managed by Submission Service."
        ));
    }
}
